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
        },
      };
      await cb(txMock);
      return txMock;
    }),
  },
}));

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key';

const generateToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, TEST_JWT_SECRET);

const PROJECT_A_ID = '123e4567-e89b-12d3-a456-426614174000';
const PROJECT_B_ID = '123e4567-e89b-12d3-a456-426614174003';
const STUDENT_ID   = '123e4567-e89b-12d3-a456-426614174001';
const APP_A_ID     = '123e4567-e89b-12d3-a456-426614174002';
const APP_B_ID     = '123e4567-e89b-12d3-a456-426614174004';
const OWNER_ID     = 'instructor-1';

describe('Application Endpoints Integration Tests', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── applyForProject ────────────────────────────────────────────────────────

  describe('POST /api/applications/apply — Multiple Applications Allowed', () => {
    it('Should allow a student to apply to Project A (201)', async () => {
      const token = generateToken(STUDENT_ID, 'STUDENT');

      (prisma.project.findUnique as any).mockResolvedValue({ id: PROJECT_A_ID, ownerId: OWNER_ID });
      (prisma.projectApplication.findUnique as any).mockResolvedValue(null);
      (prisma.projectApplication.create as any).mockResolvedValue({
        id: APP_A_ID,
        projectId: PROJECT_A_ID,
        studentId: STUDENT_ID,
        requestedRoles: ['Developer'],
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/applications/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId: PROJECT_A_ID, requestedRoles: ['Developer'] });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Application submitted successfully');
      expect(res.body.application).toBeDefined();
    });

    it('Should allow the SAME student to also apply to Project B (201)', async () => {
      const token = generateToken(STUDENT_ID, 'STUDENT');

      (prisma.project.findUnique as any).mockResolvedValue({ id: PROJECT_B_ID, ownerId: OWNER_ID });
      (prisma.projectApplication.findUnique as any).mockResolvedValue(null);
      (prisma.projectApplication.create as any).mockResolvedValue({
        id: APP_B_ID,
        projectId: PROJECT_B_ID,
        studentId: STUDENT_ID,
        requestedRoles: ['Designer'],
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/applications/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId: PROJECT_B_ID, requestedRoles: ['Designer'] });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Application submitted successfully');
      expect(res.body.application).toBeDefined();
    });

    it('Should return 400 if the student applies to the same project twice (duplicate)', async () => {
      const token = generateToken(STUDENT_ID, 'STUDENT');

      (prisma.project.findUnique as any).mockResolvedValue({ id: PROJECT_A_ID, ownerId: OWNER_ID });
      (prisma.projectApplication.findUnique as any).mockResolvedValue({
        id: APP_A_ID,
        projectId: PROJECT_A_ID,
        studentId: STUDENT_ID,
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/applications/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId: PROJECT_A_ID, requestedRoles: ['Developer'] });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('You have already applied to this project');
      expect(prisma.projectApplication.create).not.toHaveBeenCalled();
    });
  });

  // ─── respondToApplication ───────────────────────────────────────────────────

  describe('PUT /api/applications/:id/respond — 1 Student = 1 Active Project Rule', () => {
    it('Should successfully accept a student into Project A (200)', async () => {
      const token = generateToken(OWNER_ID, 'INSTRUCTOR');

      (prisma.projectApplication.findUnique as any).mockResolvedValue({
        id: APP_A_ID,
        projectId: PROJECT_A_ID,
        studentId: STUDENT_ID,
        requestedRoles: ['Developer'],
        status: 'PENDING',
        project: { id: PROJECT_A_ID, ownerId: OWNER_ID },
      });
      (prisma.teamMember.count as any).mockResolvedValue(1);
      (prisma.teamMember.findFirst as any).mockResolvedValue(null); // Not yet in any project

      const res = await request(app)
        .put(`/api/applications/${APP_A_ID}/respond`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Application accepted successfully');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('Should return 400 when accepting student into Project B if they are already a member of Project A', async () => {
      const token = generateToken(OWNER_ID, 'INSTRUCTOR');

      (prisma.projectApplication.findUnique as any).mockResolvedValue({
        id: APP_B_ID,
        projectId: PROJECT_B_ID,
        studentId: STUDENT_ID,
        requestedRoles: ['Designer'],
        status: 'PENDING',
        project: { id: PROJECT_B_ID, ownerId: OWNER_ID },
      });
      (prisma.teamMember.count as any).mockResolvedValue(1);
      // Student is ALREADY a member of Project A
      (prisma.teamMember.findFirst as any).mockResolvedValue({
        id: 'tm-abc',
        projectId: PROJECT_A_ID,
        userId: STUDENT_ID,
      });

      const res = await request(app)
        .put(`/api/applications/${APP_B_ID}/respond`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Student has already been accepted to another project');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('Should return 400 if a project owner tries to accept a student into a full project (4 members)', async () => {
      const token = generateToken(OWNER_ID, 'INSTRUCTOR');

      (prisma.projectApplication.findUnique as any).mockResolvedValue({
        id: APP_A_ID,
        projectId: PROJECT_A_ID,
        studentId: STUDENT_ID,
        status: 'PENDING',
        project: { id: PROJECT_A_ID, ownerId: OWNER_ID },
      });
      (prisma.teamMember.count as any).mockResolvedValue(4);

      const res = await request(app)
        .put(`/api/applications/${APP_A_ID}/respond`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Project has reached its maximum capacity of 4 members');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
