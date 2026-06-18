import { prisma } from "@repo/db";
import { initProjectSchema } from "@repo/types";
import type { Request, Response } from "express";

export async function initProject(req: Request, res: Response) {
  const userId = req.userId!;
  const parsed = initProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid inputs"
    })
    return
  }
  const { initialPrompt } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        title: "untitled project",
        initialPrompt,
        userId,
      }
    })

    await tx.conversationHistory.create({
      data: {
        projectId: project.id,
        type: "TEXT_MESSAGE",
        from: "USER",
        contents: initialPrompt,
      }
    })
    return {
      project
    }
  })

  res.status(201).json({
    projectId: result.project.id,
    projectTitle: result.project.title,
  });
}
