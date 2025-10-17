import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/db"; // your prisma client import

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: true,
      careerPaths: true,
      resume: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, skills, careerPaths, interests, resume } = data;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Use a transaction to ensure all or nothing
    const updatedUser = await prisma.$transaction(async (prisma) => {
      // 1. Update user's interests
      await prisma.user.update({
        where: { id: userId },
        data: {
          interests: interests,
        },
      });

      // 2. Delete existing skills and career paths for this user
      await prisma.skill.deleteMany({ where: { userId } });
      await prisma.careerPath.deleteMany({ where: { userId } });

      // 3. Create new skills and career paths
      if (skills && skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map((skill: { name: string; level: string }) => ({
            ...skill,
            userId,
          })),
        });
      }

      if (careerPaths && careerPaths.length > 0) {
        await prisma.careerPath.createMany({
          data: careerPaths.map((path: { title: string; summary: string }) => ({
            ...path,
            userId,
          })),
        });
      }
      
      // 4. Upsert the resume
      if (resume) {
        await prisma.resume.upsert({
          where: { userId },
          update: {
            summary: resume.summary,
            education: resume.education,
            experience: resume.experience,
          },
          create: {
            userId,
            summary: resume.summary,
            education: resume.education,
            experience: resume.experience,
          },
        });
      }

      // 5. Return the updated user
      return prisma.user.findUnique({ where: { id: userId } });
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Failed to save profile:", error);
    return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
  }
}
