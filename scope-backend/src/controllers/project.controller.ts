import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, description, budget, requiredSkills, categoryId, teamAd } = req.body;

    if (!title || !description || !categoryId) {
      res.status(400).json({ error: 'Missing required project fields' });
      return;
    }

    const project = await prisma.$transaction(async (tx) => {
      // Create Project
      const newProject = await tx.project.create({
        data: {
          title,
          description,
          budget,
          requiredSkills: requiredSkills || [],
          categoryId,
          ownerId: userId,
          status: 'PENDING_ADVISOR',
        }
      });

      // Add owner as TeamMember
      await tx.teamMember.create({
        data: {
          projectId: newProject.id,
          userId: userId,
          role: 'Project Lead',
        }
      });

      // Create TeamAd if provided
      if (teamAd) {
        await tx.teamAd.create({
          data: {
            projectId: newProject.id,
            authorId: userId,
            title: title, // Use project title
            description: teamAd.description,
            fullDescription: teamAd.fullDescription,
            projectType: teamAd.projectType,
            technicalSkills: teamAd.technicalSkills || [],
            interests: teamAd.interests || [],
          }
        });
      }

      return newProject;
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const getAllProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        category: true,
        advisor: {
          select: { id: true, name: true, email: true }
        },
        owner: {
          select: { id: true, name: true }
        },
        teamMembers: true,
        teamAd: true
      }
    });
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getMyProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        category: true,
        advisor: { select: { name: true } },
        teamMembers: {
          include: { user: { select: { name: true, email: true } } }
        },
        teamAd: true,
        advisorRequests: true,
        applications: true
      }
    });
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error fetching my projects:', error);
    res.status(500).json({ error: 'Failed to fetch my projects' });
  }
};
