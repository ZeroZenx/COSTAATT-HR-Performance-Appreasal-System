const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function addMelissaHeadley() {
  try {
    console.log('🚀 Adding Melissa Headley to the database...');
    
    // Check if Melissa Headley already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: 'Melissa', lastName: 'Headley' },
          { email: 'mheadley@costaatt.edu.tt' }
        ]
      }
    });

    if (existingUser) {
      console.log('⏭️ Melissa Headley already exists in the database');
      return;
    }

    const hashedPassword = await bcrypt.hash("P@ssw0rd!", 10);

    const user = await prisma.user.create({
      data: {
        email: 'mheadley@costaatt.edu.tt',
        passwordHash: hashedPassword,
        firstName: 'Melissa',
        lastName: 'Headley',
        role: 'EMPLOYEE',
        dept: 'Human Resources',
        title: 'HR Specialist',
        active: true,
        employee: {
          create: {
            dept: 'Human Resources',
            division: 'Administration',
            employmentType: 'Full-time',
            employmentCategory: 'GENERAL_STAFF',
            contractStartDate: new Date('2021-03-01'),
            contractEndDate: new Date('2026-02-28'),
            expectedAppraisalMonth: 'February',
            expectedAppraisalDay: 28,
          }
        }
      }
    });
    
    console.log('✅ Successfully added Melissa Headley to the database');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`🏢 Department: ${user.dept}`);
    console.log(`🔑 Role: ${user.role}`);
    
  } catch (error) {
    console.error('❌ Error adding Melissa Headley:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addMelissaHeadley();
