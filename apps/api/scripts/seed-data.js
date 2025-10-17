const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo users
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
      authProvider: 'LOCAL'
    },
  });

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
      authProvider: 'LOCAL'
    },
  });

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
      authProvider: 'LOCAL'
    },
  });

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

  // Create appraisal cycle
  await prisma.appraisalCycle.upsert({
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

  // Create competencies
  const competencies = [
    { code: 'COMMUNICATION', name: 'Communication Skills', description: 'Effective verbal and written communication', cluster: 'CORE' },
    { code: 'TEAMWORK', name: 'Teamwork', description: 'Collaborative working with colleagues', cluster: 'CORE' },
    { code: 'LEADERSHIP', name: 'Leadership', description: 'Leading and motivating others', cluster: 'FUNCTIONAL' }
  ];

  for (const comp of competencies) {
    await prisma.competency.upsert({
      where: { code: comp.code },
      update: {},
      create: comp,
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

