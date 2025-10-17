import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import prisma from "../../lib/db";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI client
const ai = new GoogleGenAI({});

// Define JSON schema for resource data
const resourceSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, description: "e.g. Website, Video, Article, Course" },
    title: { type: Type.STRING },
    link: { type: Type.STRING },
    description: { type: Type.STRING },
  },
  required: ["type", "title", "link", "description"],
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    resources: {
      type: Type.ARRAY,
      items: resourceSchema,
    },
  },
  required: ["resources"],
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user info from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true, careerPaths: true },
    });

    if (!user || user.skills.length === 0) {
      return NextResponse.json({ message: "no_user_data" }, { status: 200 });
    }

    const prompt = `
You are a learning resource assistant.
Given this user's skills and career paths, recommend 5 to 7 high-quality learning resources 
such as websites, YouTube videos, online courses, or articles to help them improve or explore new topics.
Include only relevant and credible resources with short descriptions.

User data:
${JSON.stringify(user, null, 2)}

Return only valid JSON following the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(response.text.trim());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error in GET /api/resources:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
