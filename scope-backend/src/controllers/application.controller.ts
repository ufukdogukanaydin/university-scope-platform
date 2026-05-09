import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export const applyForProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { projectId, requestedRoles } = req.body;

    if (userRole !== 'STUDENT') {
      res.status(403).json({ error: 'Only students can apply to projects' });
      return;
    }

    if (!projectId || !requestedRoles || requestedRoles.length === 0) {
      res.status(400).json({ error: 'Project ID and requested roles are required' });
      return;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.ownerId === userId) {
      res.status(400).json({ error: 'You cannot apply to your own project' });
      return;
    }

    // Prevent duplicate applications to the exact same project
    const existingApp = await prisma.projectApplication.findUnique({
      where: { projectId_studentId: { projectId, studentId: userId } }
    });

    if (existingApp) {
      res.status(400).json({ error: 'You have already applied to this project' });
      return;
    }

    const application = await prisma.projectApplication.create({
      data: {
        projectId,
        studentId: userId,
        requestedRoles
      }
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Error applying for project:', error);
    res.status(500).json({ error: 'Failed to apply for project' });
  }
};

export const respondToApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user!.userId;
    const { applicationId } = req.params;
    const { status, assignedRole } = req.body; // 'ACCEPTED' | 'REJECTED'

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const application = await prisma.projectApplication.findUnique({
      where: { id: applicationId },
      include: { project: true }
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.project.ownerId !== ownerId) {
      res.status(403).json({ error: 'Only the project owner can respond to applications' });
      return;
    }

    if (application.status !== 'PENDING') {
      res.status(400).json({ error: 'Application has already been processed' });
      return;
    }

    if (status === 'ACCEPTED') {
      const currentMembers = await prisma.teamMember.count({
        where: { projectId: application.projectId }
      });
      if (currentMembers >= 4) {
        res.status(400).json({ error: 'Project has reached its maximum capacity of 4 members' });
        return;
      }

      // 1 Student = 1 Project: block acceptance if student is already an active team member
      const studentMembership = await prisma.teamMember.findFirst({
        where: { userId: application.studentId }
      });
      if (studentMembership) {
        res.status(400).json({ error: 'Student has already been accepted to another project' });
        return;
      }
    }

    await prisma.$transaction(async (tx: TxClient) => {
      // Update application status
      await tx.projectApplication.update({
        where: { id: applicationId },
        data: { status }
      });

      // If accepted, add applicant to the team
      if (status === 'ACCEPTED') {
        const role = assignedRole || application.requestedRoles[0] || 'Member';
        await tx.teamMember.create({
          data: {
            projectId: application.projectId,
            userId: application.studentId,
            role: role
          }
        });

        // 1 Student = 1 Project Rule: Reject other pending applications
        await tx.projectApplication.updateMany({
          where: {
            studentId: application.studentId,
            status: 'PENDING',
            id: { not: applicationId }
          },
          data: { status: 'REJECTED' }
        });
      }
    });

    res.status(200).json({ message: `Application ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error responding to application:', error);
    res.status(500).json({ error: 'Failed to respond to application' });
  }
};
