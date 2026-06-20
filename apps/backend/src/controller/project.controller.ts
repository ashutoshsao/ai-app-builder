import { prisma } from "@repo/db";
import { getProjectSchema, initProjectSchema } from "@repo/types";
import type { Request, Response } from "express";

export async function initProject(req: Request, res: Response) {
  const userId = req.userId!;
  const parsed = initProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "invalid inputs"
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
    projectStatus: result.project.status
  });
}

export async function getProjects(req: Request, res: Response) {
  const userId = req.userId!;

  const projects = await prisma.project.findMany({
    where: {
      userId: userId
    },
    select: {
      title: true,
      id: true,
      status: true,
      updatedAt: true,
      createdAt: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  })

  res.status(200).json({
    projects: projects
  })
}

export async function getProject(req: Request, res: Response) {
  const userId = req.userId!;
  const parsed = getProjectSchema.safeParse(req.params.projectId);

  if (!parsed.success) {
    res.status(400).json({
      message: "invalid inputs"
    })
    return
  }

  const projectId = parsed.data

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  })

  if (!project) {
    res.status(404).json({
      message: `no project by you in db`
    })
    return
  }

  res.status(200).json({
    project
  })
}
