const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAlvinelleAgain() {
  try {
    console.log('🔍 Searching for Alvinelle Matthew...\n');

    // Search by name
    const usersByName = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: 'Alvinelle' } },
          { firstName: { contains: 'Matthew' } },
          { lastName: { contains: 'Matthew' } },
          { lastName: { contains: 'Alvinelle' } }
        ]
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        active: true
      }
    });

    console.log(`📊 Found ${usersByName.length} user(s) by name search:`);
    usersByName.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

    // Search by email patterns
    const usersByEmail = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'matthew' } },
          { email: { contains: 'alvinelle' } }
        ]
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        active: true
      }
    });

    console.log(`📊 Found ${usersByEmail.length} user(s) by email search:`);
    usersByEmail.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

    // If not found, create the user
    if (usersByName.length === 0 && usersByEmail.length === 0) {
      console.log('❌ Alvinelle Matthew not found. Creating new admin user...\n');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('P@ssw0rd!', 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'AMatthew@costaatt.edu.tt',
          passwordHash: hashedPassword,
          firstName: 'Alvinelle',
          lastName: 'Matthew',
          role: 'HR_ADMIN',
          dept: 'Human Resources',
          title: 'Vice President Human Resources',
          authProvider: 'LOCAL',
          active: true
        }
      });

      // Create employee record
      await prisma.employee.create({
        data: {
          userId: newUser.id,
          dept: 'Human Resources',
          division: 'Human Resources',
          employmentType: 'FULL_TIME'
        }
      });

      console.log('✅ Created new admin user for Alvinelle Matthew:');
      console.log(`   📧 Email: ${newUser.email}`);
      console.log(`   👤 Name: ${newUser.firstName} ${newUser.lastName}`);
      console.log(`   👤 Role: ${newUser.role}`);
      console.log(`   🏢 Title: ${newUser.title}`);
      console.log(`   🔐 Password: P@ssw0rd!\n`);
    }

  } catch (error) {
    console.error('❌ Error finding Alvinelle:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAlvinelleAgain();
