import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // adjust path if needed
import prisma from "../../lib/db";
// ❌ Remove this line: import OpenAI from "openai";

// ✅ Import the GoogleGenAI client and types
import { GoogleGenAI, Type } from "@google/genai";

// ✅ Initialize the client. It will automatically use GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});

// Define the expected JSON schema for the response
const jobSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    company: { type: Type.STRING },
    description: { type: Type.STRING },
    requirements: { type: Type.STRING },
    application_link: { type: Type.STRING, description: "A placeholder or realistic-looking URL." },
    deadline: { type: Type.STRING, description: "A date or 'N/A'." },
  },
  // Optionally make certain fields required
  required: ["title", "company", "description", "requirements", "application_link"],
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    jobs: {
      type: Type.ARRAY,
      items: jobSchema,
      description: "An array of 5 suggested job or internship opportunities.",
    },
  },
  required: ["jobs"],
};


export async function GET(req: NextRequest) {
  try {
    // ✅ Get user session on the server
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch user info from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, careerPaths: true },
    });

    if (!user || user.skills.length === 0 || user.careerPaths.length === 0) {
      return NextResponse.json({ message: "insufficient_profile" });
    }

    // ✅ Create the AI prompt
    const prompt = `
You are a job recommendation assistant.
Based on this user's skills and career paths, suggest 5 relevant job or internship opportunities.
Return ONLY JSON that adheres to the provided schema. DO NOT include any markdown formatting (like \`\`\`json).

User profile:
${JSON.stringify(user, null, 2)}
`;

    // ✅ Get AI-generated job data using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // A fast and capable model for this task
      contents: prompt,
      config: {
        // Enforce JSON output using a response schema
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (!response.text) {
      return NextResponse.json({ error: "AI response was empty" }, { status: 500 });
    }
    const text = response.text.trim();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error in GET /api/jobs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}