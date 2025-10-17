export const runtime = "nodejs"; // ✅ Force Node.js runtime

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import prisma from "../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { GoogleGenAI, Type } from "@google/genai";

// ✅ Initialize Gemini AI client
const ai = new GoogleGenAI({});

// ✅ Define schema Gemini should follow
const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    education: { type: Type.STRING },
    experience: { type: Type.STRING },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    highlights: { type: Type.STRING },
  },
  required: ["summary", "education", "experience", "skills"],
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ✅ Fetch user's full data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: true,
        resume: true,
        careerPaths: true,
      },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const resume = user.resume;
    const skills = user.skills;

    // ✅ Check if resume info is complete
    if (!resume || !resume.summary || !resume.education || !resume.experience) {
      return NextResponse.json({ status: "incomplete" });
    }

    // ✅ Generate AI-enhanced resume with Gemini
    const prompt = `
You are a professional resume writing assistant.
Improve this user's resume by rewriting it in a professional, clear, and concise tone.
Enhance their summary, skills, and experience phrasing.
Also include a short "Career Highlights" section.

User Data:
${JSON.stringify(
  {
    name: user.name,
    email: user.email,
    summary: resume.summary,
    education: resume.education,
    experience: resume.experience,
    skills: skills.map((s) => `${s.name} (${s.level})`),
    interests: user.careerPaths.map((c) => c.title),
  },
  null,
  2
)}

Return only valid JSON following the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
      },
    });

    if (!response.text) {
      throw new Error("AI response did not contain any text.");
    }

    const aiResume = JSON.parse(response.text.trim());

    // ✅ Create PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    const textColor = rgb(0.1, 0.1, 0.1);

    let y = height - 60;
    const write = (text: string, size = 12, offset = 20) => {
      page.drawText(text, { x: 50, y, size, font, color: textColor });
      y -= offset;
    };

    // ✅ Write resume content
    write(`${user.name}`, 20, 25);
    write(`${user.email}`, 12, 20);
    write(`Professional Summary:`, 14, 20);
    write(`${aiResume.summary}`, 12, 40);
    write(`Education:`, 14, 20);
    write(`${aiResume.education}`, 12, 40);
    write(`Experience:`, 14, 20);
    write(`${aiResume.experience}`, 12, 40);
    write(`Skills:`, 14, 20);
    write(`${aiResume.skills.join(", ")}`, 12, 30);
    if (aiResume.highlights) {
      write(`Career Highlights:`, 14, 20);
      write(`${aiResume.highlights}`, 12, 30);
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // ✅ Return PDF as downloadable response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${user.name}_Resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating resume:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
