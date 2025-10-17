const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('P@ssw0rd!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@costaatt.edu.tt' },
    update: {},
    create: {
      email: 'admin@costaatt.edu.tt',
      passwordHash: adminPassword,
      role: 'HR_ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      dept: 'Human Resources',
      title: 'HR Administrator',
      authProvider: 'LOCAL',
      active: true
    },
  });

  // Create supervisor user
  const supervisorPassword = await bcrypt.hash('password123', 12);
  const supervisor = await prisma.user.upsert({
    where: { email: 'john.doe@costaatt.edu.tt' },
    update: {},
    create: {
      email: 'john.doe@costaatt.edu.tt',
      passwordHash: supervisorPassword,
      role: 'SUPERVISOR',
      firstName: 'John',
      lastName: 'Doe',
      dept: 'Academic Affairs',
      title: 'Department Head',
      authProvider: 'LOCAL',
      active: true
    },
  });

  // Create employee user
  const employeePassword = await bcrypt.hash('password123', 12);
  const employee = await prisma.user.upsert({
    where: { email: 'mike.johnson@costaatt.edu.tt' },
    update: {},
    create: {
      email: 'mike.johnson@costaatt.edu.tt',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      firstName: 'Mike',
      lastName: 'Johnson',
      dept: 'Faculty',
      title: 'Lecturer',
      authProvider: 'LOCAL',
      active: true
    },
  });

  console.log('✅ Users created successfully');

  // Create employee records
  await prisma.employee.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      dept: 'Human Resources',
      division: 'Administration',
      employmentType: 'FULL_TIME',
      employmentCategory: 'GENERAL_STAFF'
    },
  });

  await prisma.employee.upsert({
    where: { userId: supervisor.id },
    update: {},
    create: {
      userId: supervisor.id,
      dept: 'Academic Affairs',
      division: 'Faculty',
      employmentType: 'FULL_TIME',
      employmentCategory: 'FACULTY'
    },
  });

  await prisma.employee.upsert({
    where: { userId: employee.id },
    update: {},
    create: {
      userId: employee.id,
      dept: 'Faculty',
      division: 'Faculty',
      employmentType: 'FULL_TIME',
      employmentCategory: 'FACULTY'
    },
  });

  console.log('✅ Employee records created successfully');

  // Create appraisal cycle
  const cycle = await prisma.appraisalCycle.upsert({
    where: { id: 'default-cycle' },
    update: {},
    create: {
      id: 'default-cycle',
      name: '2024 Performance Review',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-12-31'),
        status: 'ACTIVE'
      },
  });

  console.log('✅ Appraisal cycle created successfully');

  // Create competencies
    const competencies = [
      {
        code: 'COMMUNICATION',
        title: 'Communication Skills',
      definition: 'Effective verbal and written communication',
        cluster: 'CORE',
      department: 'All',
      behaviorsBasic: 'Communicates clearly in routine situations',
      behaviorsAbove: 'Adapts communication style to audience',
      behaviorsOutstanding: 'Influences and persuades effectively'
    },
    {
      code: 'TEAMWORK',
      title: 'Teamwork',
      definition: 'Collaborative working with colleagues',
      cluster: 'CORE',
      department: 'All',
      behaviorsBasic: 'Works well with team members',
      behaviorsAbove: 'Takes initiative in team projects',
      behaviorsOutstanding: 'Leads and motivates team members'
    },
    {
      code: 'LEADERSHIP',
      title: 'Leadership',
      definition: 'Leading and motivating others',
        cluster: 'FUNCTIONAL',
      department: 'Management',
      behaviorsBasic: 'Provides guidance to team members',
      behaviorsAbove: 'Develops and mentors others',
      behaviorsOutstanding: 'Inspires and drives organizational change'
    }
  ];

  for (const comp of competencies) {
    await prisma.competency.upsert({
      where: { code: comp.code },
      update: {},
      create: comp,
    });
  }

  console.log('✅ Competencies created successfully');

  // Create employee categories
  const categories = [
    {
      id: 'faculty-category',
      name: 'Faculty',
      description: 'Academic teaching staff',
      active: true
    },
    {
      id: 'staff-category',
      name: 'General Staff',
      description: 'Administrative and support staff',
      active: true
    }
  ];

  for (const category of categories) {
    await prisma.employeeCategory.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  console.log('✅ Employee categories created successfully');

  // Create rating scale
  const ratingScale = await prisma.ratingScale.upsert({
    where: { id: 'default-scale' },
    update: {},
    create: {
      id: 'default-scale',
      name: 'Standard Performance Scale',
      minValue: 1,
      maxValue: 5,
      labels: {
        1: 'Unsatisfactory',
        2: 'Below Expectations',
        3: 'Meets Expectations',
        4: 'Exceeds Expectations',
        5: 'Outstanding'
      },
      active: true
    },
  });

  console.log('✅ Rating scale created successfully');

  // Create appraisal template
  const template = await prisma.appraisalTemplate.upsert({
    where: { id: 'default-template' },
    update: {},
    create: {
      id: 'default-template',
      name: 'Standard Performance Appraisal',
        type: 'GENERAL_STAFF',
      displayName: 'Standard Performance Appraisal Template',
      version: '1.0',
      code: 'STANDARD',
      published: true,
      active: true,
      ratingScaleId: ratingScale.id,
        configJson: {
          sections: [
            {
            title: 'Performance Goals',
            weight: 0.3,
            questions: [
              {
                text: 'Rate achievement of performance goals',
                type: 'rating',
                required: true
              }
            ]
          },
          {
            title: 'Core Competencies',
            weight: 0.4,
            questions: [
              {
                text: 'Rate communication skills',
                type: 'rating',
                required: true
              },
              {
                text: 'Rate teamwork abilities',
                type: 'rating',
                required: true
              }
            ]
          },
          {
            title: 'Development Areas',
            weight: 0.3,
            questions: [
              {
                text: 'Identify areas for improvement',
                type: 'text',
                required: true
              }
            ]
          }
        ]
      }
    },
  });

  console.log('✅ Appraisal template created successfully');

  // Create system configuration
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      selfAppraisalRequired: true,
      selfRatingsEnabled: true,
      defaultAttachmentMB: 25,
      reminderDays: {
        self: 7,
        manager: 14,
        overdueCadenceDays: 3
      },
      ssoEnabled: false,
      backupScheduleCron: '0 2 * * *'
    },
  });

  console.log('✅ System configuration created successfully');

  // Create some sample FAQs
  const faqs = [
    {
      question: 'How do I complete my self-appraisal?',
      answer: 'Navigate to the Self-Appraisal section and follow the step-by-step process. Make sure to provide specific examples and evidence for each competency.',
      role: 'ALL',
      category: 'APPRAISAL',
      isActive: true
    },
    {
      question: 'What is the deadline for submitting appraisals?',
      answer: 'Appraisal deadlines are set by your supervisor and HR department. Check your appraisal cycle details for specific dates.',
      role: 'ALL',
      category: 'DEADLINES',
      isActive: true
    },
    {
      question: 'How are performance ratings calculated?',
      answer: 'Performance ratings are calculated using weighted competencies and behavioral indicators. The system automatically computes your final score.',
      role: 'ALL',
      category: 'SCORING',
      isActive: true
    }
  ];

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: { 
        id: `faq-${faq.question.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: {},
      create: {
        id: `faq-${faq.question.toLowerCase().replace(/\s+/g, '-')}`,
        ...faq
      },
    });
  }

  console.log('✅ FAQs created successfully');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Demo Login Credentials:');
  console.log('👤 Admin: admin@costaatt.edu.tt / P@ssw0rd!');
  console.log('👤 Supervisor: john.doe@costaatt.edu.tt / password123');
  console.log('👤 Employee: mike.johnson@costaatt.edu.tt / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });