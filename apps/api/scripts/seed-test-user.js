const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@costaatt.edu.tt' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('📧 Email: admin@costaatt.edu.tt');
      console.log('🔑 Password: password123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'admin@costaatt.edu.tt',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'HR_ADMIN',
        dept: 'Human Resources',
        title: 'HR Administrator',
        active: true,
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: admin@costaatt.edu.tt');
    console.log('🔑 Password: password123');
    console.log('👤 User ID:', user.id);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
