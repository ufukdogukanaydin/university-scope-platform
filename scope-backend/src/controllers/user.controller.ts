import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        advisorProfile: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const updateData = req.body;

    // Update Role-Specific Profile
    if (role === 'STUDENT') {
      await prisma.studentProfile.update({
        where: { userId },
        data: {
          year: updateData.year,
          department: updateData.department,
          bio: updateData.bio,
          education: updateData.education,
          linkedinUrl: updateData.linkedinUrl,
          githubUrl: updateData.githubUrl,
          technicalSkills: updateData.technicalSkills,
          interests: updateData.interests,
        }
      });
    } else if (role === 'INSTRUCTOR') {
      await prisma.advisorProfile.update({
        where: { userId },
        data: {
          title: updateData.title,
          department: updateData.department,
          isAvailable: updateData.isAvailable,
          expertise: updateData.expertise,
          researchInterests: updateData.researchInterests,
          previousProjects: updateData.previousProjects,
        }
      });
    }

    // Optionally update user base table (like changing their name)
    if (updateData.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: updateData.name }
      });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
