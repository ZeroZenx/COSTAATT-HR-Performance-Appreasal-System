const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function addDarrenHeadley() {
  try {
    console.log('🚀 Adding Darren Headley to the database...');
    
    // Check if Darren Headley already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: 'Darren', lastName: 'Headley' },
          { email: 'dheadley@costaatt.edu.tt' }
        ]
      }
    });

    if (existingUser) {
      console.log('⏭️ Darren Headley already exists in the database');
      return;
    }

    const hashedPassword = await bcrypt.hash("P@ssw0rd!", 10);

    const user = await prisma.user.create({
      data: {
        email: 'dheadley@costaatt.edu.tt',
        passwordHash: hashedPassword,
        firstName: 'Darren',
        lastName: 'Headley',
        role: 'SUPERVISOR',
        dept: 'Information Technology',
        title: 'IT Manager',
        active: true,
        employee: {
          create: {
            dept: 'Information Technology',
            division: 'Administration',
            employmentType: 'Full-time',
            employmentCategory: 'GENERAL_STAFF',
            contractStartDate: new Date('2020-01-01'),
            contractEndDate: new Date('2025-12-31'),
            expectedAppraisalMonth: 'December',
            expectedAppraisalDay: 31,
          }
        }
      }
    });
    
    console.log('✅ Successfully added Darren Headley to the database');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`🏢 Department: ${user.dept}`);
    console.log(`🔑 Role: ${user.role}`);
    
  } catch (error) {
    console.error('❌ Error adding Darren Headley:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addDarrenHeadley();
