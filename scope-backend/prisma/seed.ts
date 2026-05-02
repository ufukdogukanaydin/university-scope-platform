/**
 * prisma/seed.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SCOPE Platform — Development Seed Data
 *
 * Run with:  npx prisma db seed
 *
 * What gets created:
 *   • 3 Categories  (Web, Mobile, AI/ML)
 *   • 1 Admin       admin@scope.edu
 *   • 2 Advisors    advisor1@scope.edu / advisor2@scope.edu
 *   • 3 Students    student1@scope.edu / student2@scope.edu / student3@scope.edu
 *   • 3 Projects    (one per student, each in a different category)
 *   • 3 TeamAds     (recruitment posts for each project)
 *   • 2 Applications (student2 → project1, student3 → project2)
 *   • 2 AdvisorRequests (project1 → advisor1, project2 → advisor2)
 *   • 2 Announcements
 *
 * All passwords are hashed from: "Test1234!"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Test1234!';
const SALT_ROUNDS = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hash = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting SCOPE seed...\n');

  // ── 0. Clean slate (safe order respects FK constraints) ──────────────────
  console.log('🗑   Clearing existing seed data...');
  await prisma.projectApplication.deleteMany();
  await prisma.advisorRequest.deleteMany();
  await prisma.teamAd.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.advisorProfile.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  console.log('   Done.\n');

  // ── 1. Categories ─────────────────────────────────────────────────────────
  console.log('📂  Creating categories...');
  const [catWeb, catMobile, catAI] = await Promise.all([
    prisma.category.create({ data: { name: 'Web' } }),
    prisma.category.create({ data: { name: 'Mobile' } }),
    prisma.category.create({ data: { name: 'AI / ML' } }),
  ]);
  console.log(`   ✓ ${catWeb.name}, ${catMobile.name}, ${catAI.name}\n`);

  // ── 2. Users ──────────────────────────────────────────────────────────────
  console.log('👤  Creating users...');
  const password = await hash(SEED_PASSWORD);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@scope.edu',
      password,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  // Advisors
  const advisor1 = await prisma.user.create({
    data: {
      email: 'advisor1@scope.edu',
      password,
      name: 'Dr. Ayşe Kaya',
      role: 'INSTRUCTOR',
      advisorProfile: {
        create: {
          title: 'Associate Professor',
          department: 'Computer Engineering',
          isAvailable: true,
          expertise: ['Machine Learning', 'Computer Vision', 'Deep Learning'],
          researchInterests: ['Neural Networks', 'Image Recognition', 'NLP'],
          previousProjects: ['TÜBİTAK 1001 — Autonomous Drone Vision System'],
        },
      },
    },
  });

  const advisor2 = await prisma.user.create({
    data: {
      email: 'advisor2@scope.edu',
      password,
      name: 'Prof. Mehmet Demir',
      role: 'INSTRUCTOR',
      advisorProfile: {
        create: {
          title: 'Professor',
          department: 'Software Engineering',
          isAvailable: true,
          expertise: ['Mobile Development', 'Cloud Computing', 'DevOps'],
          researchInterests: ['Microservices', 'Serverless Architecture', 'Edge Computing'],
          previousProjects: [
            'Teknofest 2022 — Smart Campus App',
            'BAP — Distributed Task Scheduler',
          ],
        },
      },
    },
  });

  // Students
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@scope.edu',
      password,
      name: 'Ali Yılmaz',
      role: 'STUDENT',
      studentProfile: {
        create: {
          year: '3rd Year',
          department: 'Computer Engineering',
          bio: 'Passionate about AI and building intelligent web applications.',
          education: 'Hacettepe University — BSc Computer Engineering',
          linkedinUrl: 'https://linkedin.com/in/aliyilmaz',
          githubUrl: 'https://github.com/aliyilmaz',
          technicalSkills: ['Python', 'TensorFlow', 'React', 'Node.js', 'PostgreSQL'],
          interests: ['Machine Learning', 'Open Source', 'Hackathons'],
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@scope.edu',
      password,
      name: 'Zeynep Çelik',
      role: 'STUDENT',
      studentProfile: {
        create: {
          year: '4th Year',
          department: 'Software Engineering',
          bio: 'Mobile-first developer with a love for clean UI/UX design.',
          education: 'ODTÜ — BSc Software Engineering',
          linkedinUrl: 'https://linkedin.com/in/zeynepcelik',
          githubUrl: 'https://github.com/zeynepcelik',
          technicalSkills: ['Flutter', 'Dart', 'Swift', 'Firebase', 'Figma'],
          interests: ['Mobile Development', 'UI Design', 'Accessibility'],
        },
      },
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'student3@scope.edu',
      password,
      name: 'Burak Şahin',
      role: 'STUDENT',
      studentProfile: {
        create: {
          year: '3rd Year',
          department: 'Computer Engineering',
          bio: 'Full-stack developer interested in cloud architecture and scalable systems.',
          education: 'İTÜ — BSc Computer Engineering',
          linkedinUrl: 'https://linkedin.com/in/buraksahin',
          githubUrl: 'https://github.com/buraksahin',
          technicalSkills: ['TypeScript', 'Next.js', 'Docker', 'AWS', 'GraphQL'],
          interests: ['Cloud Computing', 'DevOps', 'System Design'],
        },
      },
    },
  });

  console.log(
    `   ✓ Admin: ${admin.email}\n` +
    `   ✓ Advisor 1: ${advisor1.email}\n` +
    `   ✓ Advisor 2: ${advisor2.email}\n` +
    `   ✓ Student 1: ${student1.email}\n` +
    `   ✓ Student 2: ${student2.email}\n` +
    `   ✓ Student 3: ${student3.email}\n`
  );

  // ── 3. Projects ───────────────────────────────────────────────────────────
  console.log('📁  Creating projects...');

  // Project 1 — AI project by student1
  const project1 = await prisma.project.create({
    data: {
      title: 'AI-Powered Academic Paper Summarizer',
      description:
        'A web platform that uses large language models to automatically summarize academic papers, ' +
        'extract key findings, and generate citation-ready abstracts. The system will support PDF upload, ' +
        'multi-language output, and a personal library for researchers.',
      budget: '15,000 TL',
      requiredSkills: ['Python', 'NLP', 'React', 'FastAPI', 'PostgreSQL'],
      status: 'PENDING_ADVISOR',
      categoryId: catAI.id,
      ownerId: student1.id,
      teamMembers: {
        create: { userId: student1.id, role: 'Project Lead' },
      },
    },
  });

  // Project 2 — Mobile project by student2
  const project2 = await prisma.project.create({
    data: {
      title: 'Campus Navigator — Indoor Wayfinding App',
      description:
        'A Flutter-based mobile application that provides real-time indoor navigation across university ' +
        'buildings using Bluetooth Low Energy beacons. Features include classroom finder, event scheduling, ' +
        'and accessibility-friendly routes for disabled students.',
      budget: '8,500 TL',
      requiredSkills: ['Flutter', 'Dart', 'BLE', 'Firebase', 'Figma'],
      status: 'ADVISOR_ASSIGNED',
      categoryId: catMobile.id,
      ownerId: student2.id,
      advisorId: advisor2.id,
      teamMembers: {
        create: { userId: student2.id, role: 'Project Lead' },
      },
    },
  });

  // Project 3 — Web project by student3
  const project3 = await prisma.project.create({
    data: {
      title: 'Open-Source University Internship Portal',
      description:
        'A centralized web platform where companies post internship opportunities and students apply ' +
        'directly through their university accounts. Includes a matching algorithm based on skills, ' +
        'automated email notifications, and an admin dashboard for department coordinators.',
      budget: '12,000 TL',
      requiredSkills: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      status: 'IN_PROGRESS',
      categoryId: catWeb.id,
      ownerId: student3.id,
      teamMembers: {
        create: { userId: student3.id, role: 'Project Lead' },
      },
    },
  });

  console.log(
    `   ✓ "${project1.title}" (AI)\n` +
    `   ✓ "${project2.title}" (Mobile)\n` +
    `   ✓ "${project3.title}" (Web)\n`
  );

  // ── 4. Team Ads ───────────────────────────────────────────────────────────
  console.log('📢  Creating team recruitment ads...');

  await prisma.teamAd.createMany({
    data: [
      {
        projectId: project1.id,
        authorId: student1.id,
        title: 'AI-Powered Academic Paper Summarizer',
        description: 'Looking for an NLP Engineer and a React Developer to join our AI research tool.',
        fullDescription:
          'We are building an AI platform to help researchers digest academic papers faster. ' +
          'We need a backend engineer comfortable with Python and Hugging Face, and a frontend ' +
          'developer to build a clean, responsive React UI. This is a TÜBİTAK candidate project.',
        projectType: 'AI / ML',
        technicalSkills: ['Python', 'HuggingFace', 'React', 'FastAPI'],
        interests: ['NLP', 'Academic Research', 'Open Source'],
      },
      {
        projectId: project2.id,
        authorId: student2.id,
        title: 'Campus Navigator — Indoor Wayfinding App',
        description: 'Seeking a Flutter developer and a BLE hardware specialist.',
        fullDescription:
          'Our campus navigation app already has an advisor and needs one more Flutter developer ' +
          'with experience in Bluetooth beacon integrations. A background in UX/accessibility is a plus.',
        projectType: 'Mobile',
        technicalSkills: ['Flutter', 'Dart', 'BLE', 'Firebase'],
        interests: ['Mobile Development', 'Accessibility', 'Smart Campus'],
      },
      {
        projectId: project3.id,
        authorId: student3.id,
        title: 'Open-Source University Internship Portal',
        description: 'Need a DevOps engineer and a UI/UX designer for our internship platform.',
        fullDescription:
          'The core API and database are done. We need someone to set up CI/CD pipelines with Docker ' +
          'and GitHub Actions, and a designer to polish the student-facing dashboard.',
        projectType: 'Web',
        technicalSkills: ['Docker', 'GitHub Actions', 'Next.js', 'Figma'],
        interests: ['DevOps', 'UI Design', 'Web Development'],
      },
    ],
  });
  console.log('   ✓ 3 team ads created\n');

  // ── 5. Applications ───────────────────────────────────────────────────────
  console.log('📝  Creating project applications...');

  // student2 applies to project1 (owned by student1)
  await prisma.projectApplication.create({
    data: {
      projectId: project1.id,
      studentId: student2.id,
      requestedRoles: ['React Developer', 'UI Designer'],
      status: 'PENDING',
    },
  });

  // student3 applies to project1 as well (different student, same project)
  await prisma.projectApplication.create({
    data: {
      projectId: project1.id,
      studentId: student3.id,
      requestedRoles: ['NLP Engineer', 'Backend Developer'],
      status: 'ACCEPTED',
    },
  });

  // student1 applies to project3 (owned by student3)
  await prisma.projectApplication.create({
    data: {
      projectId: project3.id,
      studentId: student1.id,
      requestedRoles: ['AI/ML Integration Specialist'],
      status: 'PENDING',
    },
  });

  console.log('   ✓ 3 applications created\n');

  // ── 6. Advisor Requests ───────────────────────────────────────────────────
  console.log('🤝  Creating advisor requests...');

  // project1 requests advisor1
  await prisma.advisorRequest.create({
    data: {
      projectId: project1.id,
      advisorId: advisor1.id,
      status: 'PENDING',
      message:
        'Dear Dr. Kaya, we are working on an AI-powered paper summarizer using transformer models. ' +
        'Given your expertise in NLP and Deep Learning, we would be honoured if you could supervise our project.',
    },
  });

  // project3 requests advisor1 as well (to test competition scenario)
  await prisma.advisorRequest.create({
    data: {
      projectId: project3.id,
      advisorId: advisor1.id,
      status: 'REJECTED',
      message:
        'Hello Dr. Kaya, our internship portal uses an ML matching algorithm and we would love your guidance.',
    },
  });

  console.log('   ✓ 2 advisor requests created\n');

  // ── 7. Announcements ──────────────────────────────────────────────────────
  console.log('📣  Creating announcements...');

  await prisma.announcement.createMany({
    data: [
      {
        title: 'TÜBİTAK 2209-A Başvuruları Açıldı',
        category: 'TÜBİTAK',
        content:
          'Üniversite Öğrencileri Araştırma Projeleri Destekleme Programı (2209-A) kapsamındaki ' +
          '2024 yılı başvuruları açılmıştır. Son başvuru tarihi 15 Haziran 2024\'tür. ' +
          'Proje önerinizi SCOPE platformu üzerinden danışmanınızla hazırlayabilirsiniz.',
      },
      {
        title: 'Teknofest 2024 Kayıtları Başladı',
        category: 'Teknofest',
        content:
          'TEKNOFEST Türkiye Teknoloji Yarışmaları 2024 kayıtları başlamıştır. ' +
          'Yapay Zeka, Savunma Sanayi ve Sağlık kategorilerinde takım oluşturmak isteyen ' +
          'öğrenciler SCOPE üzerinden danışman talep edebilir ve takım ilanı yayınlayabilir.',
      },
      {
        title: 'Spring 2024 — Capstone Project Submission Deadline',
        category: 'General',
        content:
          'All SE302 capstone projects must be submitted via the SCOPE platform by May 30, 2024. ' +
          'Projects without an assigned advisor by May 15 will be automatically escalated to the ' +
          'department coordinator. Please ensure your team and advisor information are up to date.',
      },
    ],
  });
  console.log('   ✓ 3 announcements created\n');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log('✅  Seed completed successfully!\n');
  console.log('Login credentials (all use password: Test1234!)');
  console.log('─'.repeat(60));
  console.log('  ADMIN    →  admin@scope.edu');
  console.log('  ADVISOR  →  advisor1@scope.edu  (Dr. Ayşe Kaya)');
  console.log('  ADVISOR  →  advisor2@scope.edu  (Prof. Mehmet Demir)');
  console.log('  STUDENT  →  student1@scope.edu  (Ali Yılmaz)');
  console.log('  STUDENT  →  student2@scope.edu  (Zeynep Çelik)');
  console.log('  STUDENT  →  student3@scope.edu  (Burak Şahin)');
  console.log('─'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
