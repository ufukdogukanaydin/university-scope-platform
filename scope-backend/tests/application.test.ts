import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/server';
import { prisma } from '../src/prisma/client';
import jwt from 'jsonwebtoken';

jest.mock('../src/prisma/client', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
    },
    projectApplication: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    teamMember: {
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(async (cb: any) => {
      const txMock = {
        projectApplication: {
          update: jest.fn(),
          updateMany: jest.fn(),
        },
        teamMember: {
          create: jest.fn(),
        }
      };
      await cb(txMock);
      return txMock;
    }),
  },
}));

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key';

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, TEST_JWT_SECRET);
};

// Use valid UUIDs to pass Zod validation
const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174000';
const STUDENT_ID = '123e4567-e89b-12d3-a456-426614174001';
const APP_ID = '123e4567-e89b-12d3-a456-426614174002';
const OTHER_PROJECT_ID = '123e4567-e89b-12d3-a456-426614174003';

describe('Application Endpoints Integration Tests', () => {
  beforeAll(() => {
    // Ensure the secret matches the one used in the middleware during testing
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/applications/apply', () => {
    it('Should successfully apply to a project', async () => {
      const token = generateToken(STUDENT_ID, 'STUDENT');

      // 1. Mock project exists and user is not the owner
      (prisma.project.findUnique as any).mockResolvedValue({ id: PROJECT_ID, ownerId: 'instructor-1' });
      // 2. Mock student is NOT a member of ANY project
      (prisma.teamMember.findFirst as any).mockResolvedValue(null);
      // 3. Mock no existing application for this project
      (prisma.projectApplication.findUnique as any).mockResolvedValue(null);
      // 4. Mock successful application creation
      (prisma.projectApplication.create as any).mockResolvedValue({
        id: APP_ID,
        projectId: PROJECT_ID,
        studentId: STUDENT_ID,
        requestedRoles: ['Developer'],
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/applications/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId: PROJECT_ID, requestedRoles: ['Developer'] });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Application submitted successfully');
      expect(res.body.application).toBeDefined();
    });

    it('Should return 400 if a student is already a team member of another project and tries to apply', async () => {
      const token = generateToken(STUDENT_ID, 'STUDENT');

      // Mock project exists
      (prisma.project.findUnique as any).mockResolvedValue({ id: PROJECT_ID, ownerId: 'instructor-1' });
      
      // MOCK: Student IS already a member of another project
      (prisma.teamMember.findFirst as any).mockResolvedValue({
        id: 'tm-abc',
        projectId: OTHER_PROJECT_ID, // A different project
        userId: STUDENT_ID,
      });

      const res = await request(app)
        .post('/api/applications/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId: PROJECT_ID, requestedRoles: ['Developer'] });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('You are already a member of a project');
      // Ensure we blocked the application creation
      expect(prisma.projectApplication.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/applications/:id/respond', () => {
    it('Should return 400 if a project owner tries to accept a student, but the project already has 4 team members', async () => {
      const ownerId = 'instructor-1';
      const token = generateToken(ownerId, 'INSTRUCTOR');

      // Mock the application exists, is PENDING, and belongs to the owner's project
      (prisma.projectApplication.findUnique as any).mockResolvedValue({
        id: APP_ID,
        projectId: PROJECT_ID,
        studentId: STUDENT_ID,
        status: 'PENDING',
        project: {
          id: PROJECT_ID,
          ownerId: ownerId, // Matches the token
        }
      });

      // MOCK: Project already has 4 members
      (prisma.teamMember.count as any).mockResolvedValue(4);

      const res = await request(app)
        .put(`/api/applications/${APP_ID}/respond`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Project has reached its maximum capacity of 4 members');
      // Ensure the transaction (accepting app/creating member) never executed
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
