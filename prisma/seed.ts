import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const testUserEmail = 'test@example.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail },
  });

  if (existingUser) {
    console.log('✅ Test user already exists:', testUserEmail);
    console.log('   User ID:', existingUser.id);
    return;
  }

  console.log('Creating test user...');
  const testUser = await prisma.user.create({
    data: {
      email: testUserEmail,
      name: 'Test User',
      passwordHash: hashPassword('password123'),
      rememberMe: true,
    },
  });

  console.log('✅ Created test user:', testUser.email);
  console.log('   Password: password123');
  console.log('   User ID:', testUser.id);

  console.log('\nCreating profile...');
  await prisma.profile.create({
    data: {
      userId: testUser.id,
      headline: 'Senior Full-Stack Developer',
      summary: 'Experienced developer with expertise in React, TypeScript, and Node.js',
      location: 'San Francisco, CA',
      desiredTitles: 'Senior Engineer,Staff Engineer,Engineering Manager',
      desiredWorkModes: 'REMOTE,HYBRID',
      minSalaryUsd: 150000,
      maxSalaryUsd: 250000,
    },
  });

  console.log('✅ Created profile');

  console.log('\nCreating skills...');
  const skills = [
    { name: 'TypeScript', level: 5, years: 5, isCore: true },
    { name: 'React', level: 5, years: 6, isCore: true },
    { name: 'Node.js', level: 4, years: 5, isCore: true },
    { name: 'Next.js', level: 4, years: 3, isCore: false },
    { name: 'PostgreSQL', level: 4, years: 4, isCore: false },
    { name: 'AWS', level: 3, years: 3, isCore: false },
    { name: 'Docker', level: 3, years: 2, isCore: false },
    { name: 'GraphQL', level: 3, years: 2, isCore: false },
  ];

  for (const skill of skills) {
    await prisma.skill.create({
      data: {
        userId: testUser.id,
        ...skill,
      },
    });
  }

  console.log(`✅ Created ${skills.length} skills`);

  console.log('\nCreating companies...');
  const companies = [
    {
      name: 'TechCorp',
      website: 'https://techcorp.example.com',
      location: 'San Francisco, CA',
      industry: 'Software',
      size: '1000-5000',
    },
    {
      name: 'StartupCo',
      website: 'https://startupco.example.com',
      location: 'Remote',
      industry: 'SaaS',
      size: '50-200',
    },
    {
      name: 'BigTech Inc',
      website: 'https://bigtech.example.com',
      location: 'Seattle, WA',
      industry: 'Technology',
      size: '10000+',
    },
  ];

  const createdCompanies = [];
  for (const company of companies) {
    const created = await prisma.company.create({
      data: {
        userId: testUser.id,
        ...company,
      },
    });
    createdCompanies.push(created);
  }

  console.log(`✅ Created ${companies.length} companies`);

  console.log('\nCreating jobs...');
  const jobs = [
    {
      companyId: createdCompanies[0].id,
      title: 'Senior Frontend Engineer',
      location: 'San Francisco, CA',
      workMode: 'HYBRID' as const,
      salaryMinUsd: 160000,
      salaryMaxUsd: 220000,
      seniority: 'Senior',
      employmentType: 'Full-time',
      description: 'Looking for an experienced frontend engineer to join our team.',
      source: 'manual',
      matchScore: 85,
    },
    {
      companyId: createdCompanies[1].id,
      title: 'Full-Stack Developer',
      location: 'Remote',
      workMode: 'REMOTE' as const,
      salaryMinUsd: 140000,
      salaryMaxUsd: 180000,
      seniority: 'Mid-Senior',
      employmentType: 'Full-time',
      description: 'Join our fast-growing startup as a full-stack developer.',
      source: 'manual',
      matchScore: 78,
    },
    {
      companyId: createdCompanies[2].id,
      title: 'Staff Software Engineer',
      location: 'Seattle, WA',
      workMode: 'HYBRID' as const,
      salaryMinUsd: 200000,
      salaryMaxUsd: 280000,
      seniority: 'Staff',
      employmentType: 'Full-time',
      description: 'Lead critical projects and mentor junior engineers.',
      source: 'manual',
      matchScore: 92,
    },
    {
      companyId: createdCompanies[0].id,
      title: 'Engineering Manager',
      location: 'San Francisco, CA',
      workMode: 'ONSITE' as const,
      salaryMinUsd: 180000,
      salaryMaxUsd: 240000,
      seniority: 'Manager',
      employmentType: 'Full-time',
      description: 'Manage a team of 8-10 engineers building our core platform.',
      source: 'manual',
      matchScore: 70,
    },
  ];

  const createdJobs = [];
  for (const job of jobs) {
    const created = await prisma.job.create({
      data: {
        userId: testUser.id,
        ...job,
      },
    });
    createdJobs.push(created);
  }

  console.log(`✅ Created ${jobs.length} jobs`);

  console.log('\nCreating applications...');
  const applications = [
    {
      jobId: createdJobs[0].id,
      stage: 'APPLIED' as const,
      appliedAt: new Date('2026-02-01'),
      nextFollowUpAt: new Date('2026-02-10'),
      notes: 'Reached out to hiring manager via LinkedIn',
    },
    {
      jobId: createdJobs[1].id,
      stage: 'RECRUITER_SCREEN' as const,
      appliedAt: new Date('2026-01-28'),
      nextFollowUpAt: new Date('2026-02-08'),
      contactName: 'Jane Smith',
      contactEmail: 'jane@startupco.example.com',
      notes: 'Phone screen scheduled for next week',
    },
    {
      jobId: createdJobs[2].id,
      stage: 'INTERESTED' as const,
      notes: 'High match score - research company culture before applying',
    },
    {
      jobId: createdJobs[3].id,
      stage: 'INTERVIEW' as const,
      appliedAt: new Date('2026-01-20'),
      nextFollowUpAt: new Date('2026-02-12'),
      contactName: 'John Doe',
      contactEmail: 'john@techcorp.example.com',
      notes: 'Technical interview completed - waiting for final round',
    },
  ];

  const createdApplications = [];
  for (const app of applications) {
    const created = await prisma.application.create({
      data: {
        userId: testUser.id,
        ...app,
      },
    });
    createdApplications.push(created);
  }

  console.log(`✅ Created ${applications.length} applications`);

  console.log('\nCreating contacts...');
  const contacts = [
    {
      name: 'Alice Johnson',
      company: 'TechCorp',
      title: 'Engineering Manager',
      email: 'alice@techcorp.example.com',
      linkedinUrl: 'https://linkedin.com/in/alicejohnson',
      strength: 4,
      tags: 'mutual,former coworker',
    },
    {
      name: 'Bob Williams',
      company: 'StartupCo',
      title: 'CTO',
      email: 'bob@startupco.example.com',
      linkedinUrl: 'https://linkedin.com/in/bobwilliams',
      strength: 3,
      tags: 'referral',
      hiringSignal: true,
      hiringKeywords: 'hiring,open roles',
      hiringNotes: 'Posted about hiring on LinkedIn last week',
    },
    {
      name: 'Carol Davis',
      company: 'BigTech Inc',
      title: 'Senior Recruiter',
      email: 'carol@bigtech.example.com',
      linkedinUrl: 'https://linkedin.com/in/caroldavis',
      strength: 2,
      tags: 'recruiter',
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.create({
      data: {
        userId: testUser.id,
        ...contact,
      },
    });
  }

  console.log(`✅ Created ${contacts.length} contacts`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
  console.log('\n🚀 Start the dev server: npm run dev');
  console.log('   Then go to: http://localhost:3000/signin');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
