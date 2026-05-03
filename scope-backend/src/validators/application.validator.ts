import { z } from 'zod';

export const applyToProjectSchema = z.object({
  body: z.object({
    projectId: z.string().uuid({ message: 'Invalid Project ID format. Must be a valid UUID' }),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    applicationId: z.string().uuid({ message: 'Invalid Application ID format. Must be a valid UUID' }),
  }),
  body: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED'], {
      message: 'Status must be either ACCEPTED or REJECTED',
    }),
  }),
});
