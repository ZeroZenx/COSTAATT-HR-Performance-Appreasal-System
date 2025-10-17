const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function makeAlvinelleAdmin() {
  try {
    console.log('🔧 Making Alvinelle Matthew an admin...');

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'knurse@costaatt.edu.tt' }
    });

    if (!existingUser) {
      console.log('❌ User not found. Creating new admin user for Alvinelle Matthew...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('P@ssw0rd!', 10);

      // Create new admin user
      const user = await prisma.user.create({
        data: {
          email: 'knurse@costaatt.edu.tt',
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
          userId: user.id,
          dept: 'Human Resources',
          division: 'Human Resources',
          employmentType: 'FULL_TIME',
          categoryId: null
        }
      });

      console.log('✅ Created new admin user for Alvinelle Matthew');
      console.log('📧 Email: knurse@costaatt.edu.tt');
      console.log('🔑 Password: P@ssw0rd!');
      console.log('👤 Role: HR_ADMIN');
      console.log('🏢 Title: Vice President Human Resources');

    } else {
      console.log('✅ User found. Updating role to HR_ADMIN...');
      
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email: 'knurse@costaatt.edu.tt' },
        data: {
          role: 'HR_ADMIN',
          title: 'Vice President Human Resources',
          dept: 'Human Resources',
          active: true
        }
      });

      console.log('✅ Successfully updated Alvinelle Matthew to HR_ADMIN');
      console.log('📧 Email: knurse@costaatt.edu.tt');
      console.log('👤 Role: HR_ADMIN');
      console.log('🏢 Title: Vice President Human Resources');
    }

  } catch (error) {
    console.error('❌ Error making Alvinelle Matthew admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAlvinelleAdmin();
