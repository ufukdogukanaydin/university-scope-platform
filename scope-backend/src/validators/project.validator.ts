import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long').max(100, 'Title must not exceed 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    budget: z.string().min(1, 'Budget is required').max(50, 'Budget description is too long'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(100).optional(),
    description: z.string().min(10).optional(),
    budget: z.string().max(50).optional(),
    skills: z.array(z.string()).min(1).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
});
