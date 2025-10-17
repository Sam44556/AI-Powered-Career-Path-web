import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import prisma from "../../lib/db";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});

// ✅ Define the structured JSON schema for the AI output
const skillSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A short summary of the user's overall skill level." },
    skills_analysis: {
      type: Type.ARRAY,
      description: "Detailed breakdown of each skill with strengths and growth recommendations.",
      items: {
        type: Type.OBJECT,
        properties: {
          skill_name: { type: Type.STRING },
          current_level: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommended_learning_paths: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["skill_name", "current_level", "strengths", "improvements", "recommended_learning_paths"],
      },
    },
    suggested_next_skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "New or related skills to learn next.",
    },
  },
  required: ["summary", "skills_analysis", "suggested_next_skills"],
};

export async function GET(req: NextRequest) {
  try {
    // ✅ Authenticate user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch full user profile from Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, careerPaths: true },
    });

    if (!user || user.skills.length === 0) {
      return NextResponse.json({ error: "No skills found for this user." }, { status: 404 });
    }

    // ✅ Prepare a personalized AI prompt
    const prompt = `
You are a career and learning advisor AI.
The following user has these skills and career goals.
Provide a detailed skill growth analysis as structured JSON following the given schema.

User profile:
${JSON.stringify(user, null, 2)}

Respond ONLY with valid JSON that matches the schema.
No markdown or explanations.
`;

    // ✅ Send the structured request to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: skillSchema,
      },
    });

    if (!response.text) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(response.text.trim());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error in GET /api/skills:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
