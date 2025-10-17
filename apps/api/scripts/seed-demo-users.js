const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDemoUsers() {
  try {
    console.log('🌱 Seeding demo users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('P@ssw0rd!', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    // Create demo users
    const demoUsers = [
      {
        email: 'admin@costaatt.edu.tt',
        firstName: 'Admin',
        lastName: 'User',
        password: adminPassword,
        role: 'HR_ADMIN',
        dept: 'Human Resources',
        title: 'HR Administrator',
        authProvider: 'LOCAL',
        active: true
      },
      {
        email: 'john.doe@costaatt.edu.tt',
        firstName: 'John',
        lastName: 'Doe',
        password: userPassword,
        role: 'SUPERVISOR',
        dept: 'Business',
        title: 'Department Head',
        authProvider: 'LOCAL',
        active: true
      },
      {
        email: 'mike.johnson@costaatt.edu.tt',
        firstName: 'Mike',
        lastName: 'Johnson',
        password: userPassword,
        role: 'EMPLOYEE',
        dept: 'Information Technology',
        title: 'IT Specialist',
        authProvider: 'LOCAL',
        active: true
      }
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const user = await prisma.user.create({
          data: userData
        });

        // Create employee record for each user
        await prisma.employee.create({
          data: {
            userId: user.id,
            dept: userData.dept,
            division: userData.dept,
            employmentType: 'FULL_TIME',
            categoryId: null
          }
        });

        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    console.log('🎉 Demo users seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('Admin: admin@costaatt.edu.tt / P@ssw0rd!');
    console.log('Supervisor: john.doe@costaatt.edu.tt / password123');
    console.log('Employee: mike.johnson@costaatt.edu.tt / password123');

  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoUsers();
