import { PrismaClient, UserRole, AppraisalTemplateType, CompetencyCluster, AppraisalStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
      role: UserRole.HR_ADMIN,
      firstName: 'HR',
      lastName: 'Administrator',
      dept: 'Human Resources',
      title: 'HR Manager',
    },
  });

  console.log('✅ Admin user created');

  // Create sample users
  const users = [
    {
      email: 'john.doe@costaatt.edu.tt',
      passwordHash: await bcrypt.hash('password123', 12),
      role: UserRole.SUPERVISOR,
      firstName: 'John',
      lastName: 'Doe',
      dept: 'Faculty',
      title: 'Dean of Faculty',
    },
    {
      email: 'jane.smith@costaatt.edu.tt',
      passwordHash: await bcrypt.hash('password123', 12),
      role: UserRole.SUPERVISOR,
      firstName: 'Jane',
      lastName: 'Smith',
      dept: 'Clinical',
      title: 'Clinical Director',
    },
    {
      email: 'mike.johnson@costaatt.edu.tt',
      passwordHash: await bcrypt.hash('password123', 12),
      role: UserRole.EMPLOYEE,
      firstName: 'Mike',
      lastName: 'Johnson',
      dept: 'Faculty',
      title: 'Lecturer',
    },
    {
      email: 'sarah.wilson@costaatt.edu.tt',
      passwordHash: await bcrypt.hash('password123', 12),
      role: UserRole.EMPLOYEE,
      firstName: 'Sarah',
      lastName: 'Wilson',
      dept: 'Clinical',
      title: 'Clinical Instructor',
    },
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    createdUsers.push(user);
  }

  console.log('✅ Sample users created');

  // Create employees
  const employees = [
    {
      userId: createdUsers[0].id,
      dept: 'Faculty',
      division: 'Academic Affairs',
      employmentType: 'Full-time',
      supervisorId: null,
    },
    {
      userId: createdUsers[1].id,
      dept: 'Clinical',
      division: 'Health Sciences',
      employmentType: 'Full-time',
      supervisorId: null,
    },
    {
      userId: createdUsers[2].id,
      dept: 'Faculty',
      division: 'Academic Affairs',
      employmentType: 'Full-time',
      supervisorId: null, // Will be updated after employee creation
    },
    {
      userId: createdUsers[3].id,
      dept: 'Clinical',
      division: 'Health Sciences',
      employmentType: 'Full-time',
      supervisorId: null, // Will be updated after employee creation
    },
  ];

  const createdEmployees = [];
  for (const empData of employees) {
    const employee = await prisma.employee.create({
      data: empData,
    });
    createdEmployees.push(employee);
  }

  // Update supervisor relationships
  await prisma.employee.update({
    where: { id: createdEmployees[2].id },
    data: { supervisorId: createdEmployees[0].id },
  });

  await prisma.employee.update({
    where: { id: createdEmployees[3].id },
    data: { supervisorId: createdEmployees[1].id },
  });

  console.log('✅ Employees created');

  // Create appraisal cycle
  const cycle = await prisma.appraisalCycle.create({
    data: {
      name: '2024 Performance Appraisal Cycle',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-12-31'),
      status: 'ACTIVE',
    },
  });

  console.log('✅ Appraisal cycle created');

  // Create appraisal templates
  const templates = [
    {
      name: 'Dean Performance Appraisal',
      type: AppraisalTemplateType.DEAN,
      configJson: {
        denominators: { functional: 117, core: 99, projects: 12 },
        weights: { functional: 0.50, core: 0.30, projects: 0.20 },
        maxScores: { functional: 117, core: 99, projects: 12 },
      },
    },
    {
      name: 'Faculty Performance Appraisal',
      type: AppraisalTemplateType.FACULTY,
      configJson: {
        denominators: { functional: 114, core: 99, studentEvaluations: 50, projects: 12 },
        weights: { functional: 0.50, core: 0.30, studentEvaluations: 0.20, projects: 0.00 },
        maxScores: { functional: 114, core: 99, studentEvaluations: 50, projects: 12 },
      },
    },
    {
      name: 'Clinical Instructor Performance Appraisal',
      type: AppraisalTemplateType.CLINICAL,
      configJson: {
        denominators: { functional: 81, core: 72, studentEvaluations: 30 },
        weights: { functional: 0.60, core: 0.20, studentEvaluations: 0.20 },
        maxScores: { functional: 81, core: 72, studentEvaluations: 30 },
      },
    },
  ];

  const createdTemplates = [];
  for (const templateData of templates) {
    const template = await prisma.appraisalTemplate.create({
      data: templateData,
    });
    createdTemplates.push(template);
  }

  console.log('✅ Appraisal templates created');

  // Create competencies
  const competencies = [
    {
      code: 'CORE001',
      title: 'Communication',
      cluster: CompetencyCluster.CORE,
      department: 'All',
      definition: 'Ability to communicate effectively with students, colleagues, and stakeholders',
      behaviorsBasic: 'Communicates clearly in written and verbal form',
      behaviorsAbove: 'Adapts communication style to different audiences',
      behaviorsOutstanding: 'Mentors others in effective communication techniques',
    },
    {
      code: 'CORE002',
      title: 'Leadership',
      cluster: CompetencyCluster.CORE,
      department: 'All',
      definition: 'Demonstrates leadership qualities and initiative',
      behaviorsBasic: 'Takes initiative in assigned tasks',
      behaviorsAbove: 'Leads small teams or projects effectively',
      behaviorsOutstanding: 'Inspires and motivates others to achieve excellence',
    },
    {
      code: 'FUNC001',
      title: 'Curriculum Development',
      cluster: CompetencyCluster.FUNCTIONAL,
      department: 'Faculty',
      definition: 'Ability to develop and maintain effective curricula',
      behaviorsBasic: 'Updates course materials regularly',
      behaviorsAbove: 'Designs innovative learning experiences',
      behaviorsOutstanding: 'Leads curriculum reform initiatives',
    },
    {
      code: 'FUNC002',
      title: 'Clinical Supervision',
      cluster: CompetencyCluster.FUNCTIONAL,
      department: 'Clinical',
      definition: 'Effective supervision of clinical students',
      behaviorsBasic: 'Provides clear guidance to students',
      behaviorsAbove: 'Identifies and addresses learning needs',
      behaviorsOutstanding: 'Develops innovative clinical teaching methods',
    },
  ];

  const createdCompetencies = [];
  for (const compData of competencies) {
    const competency = await prisma.competency.create({
      data: compData,
    });
    createdCompetencies.push(competency);
  }

  console.log('✅ Competencies created');

  // Create sample appraisals
  const appraisal1 = await prisma.appraisal.create({
    data: {
      employeeId: createdEmployees[2].id,
      supervisorId: createdUsers[0].id,
      templateId: createdTemplates[1].id,
      cycleId: cycle.id,
      status: AppraisalStatus.DRAFT,
    },
  });

  // Add competency selections
  await prisma.competencySelection.createMany({
    data: [
      { appraisalId: appraisal1.id, competencyId: createdCompetencies[0].id, type: CompetencyCluster.CORE },
      { appraisalId: appraisal1.id, competencyId: createdCompetencies[1].id, type: CompetencyCluster.CORE },
      { appraisalId: appraisal1.id, competencyId: createdCompetencies[2].id, type: CompetencyCluster.FUNCTIONAL },
    ],
  });

  // Add some criterion scores
  await prisma.criterionScore.createMany({
    data: [
      { appraisalId: appraisal1.id, sectionKey: 'functional', criterionKey: 'teaching', score: 85, max: 100 },
      { appraisalId: appraisal1.id, sectionKey: 'functional', criterionKey: 'research', score: 75, max: 100 },
      { appraisalId: appraisal1.id, sectionKey: 'core', criterionKey: 'communication', score: 90, max: 100 },
      { appraisalId: appraisal1.id, sectionKey: 'core', criterionKey: 'leadership', score: 80, max: 100 },
    ],
  });

  // Add student evaluations
  await prisma.studentEvaluation.createMany({
    data: [
      { appraisalId: appraisal1.id, courseCode: 'MATH101', courseTitle: 'Mathematics I', avgOutOf5: 4.2 },
      { appraisalId: appraisal1.id, courseCode: 'MATH102', courseTitle: 'Mathematics II', avgOutOf5: 4.5 },
    ],
  });

  // Add goals
  await prisma.goal.createMany({
    data: [
      {
        appraisalId: appraisal1.id,
        title: 'Improve Student Engagement',
        description: 'Implement interactive teaching methods to increase student participation',
        weight: 30,
        measures: 'Student feedback scores above 4.0',
        timeline: 'End of semester',
        resources: 'Training workshops, technology tools',
        relevance: 'Directly impacts student learning outcomes',
        roadblocks: 'Resistance to change, time constraints',
        progressPercent: 60,
      },
      {
        appraisalId: appraisal1.id,
        title: 'Research Publication',
        description: 'Publish research paper in peer-reviewed journal',
        weight: 20,
        measures: 'Accepted publication in Q1 journal',
        timeline: '6 months',
        resources: 'Research time, conference attendance',
        relevance: 'Contributes to institutional reputation',
        roadblocks: 'Limited research time, funding constraints',
        progressPercent: 40,
      },
    ],
  });

  console.log('✅ Sample appraisal created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('📧 Admin login: admin@costaatt.edu.tt / P@ssw0rd!');
  console.log('👥 Sample users: john.doe@costaatt.edu.tt, jane.smith@costaatt.edu.tt, etc. / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

