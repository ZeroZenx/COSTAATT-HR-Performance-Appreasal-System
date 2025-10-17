const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMarciaUser() {
  try {
    console.log('🔍 Checking Marcia Stanisclaus user details...\n');

    // Check for existing Marcia Stanisclaus
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: { contains: 'Marcia', mode: 'insensitive' } },
          { lastName: { contains: 'Stanisclaus', mode: 'insensitive' } }
        ]
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        dept: true,
        active: true
      }
    });

    if (existingUser) {
      console.log('✅ Found existing Marcia Stanisclaus:');
      console.log(`   📧 Email: ${existingUser.email}`);
      console.log(`   👤 Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`   🏢 Title: ${existingUser.title}`);
      console.log(`   🏬 Department: ${existingUser.dept}`);
      console.log(`   👤 Role: ${existingUser.role}`);
      console.log(`   ✅ Active: ${existingUser.active ? 'Yes' : 'No'}\n`);
      
      if (existingUser.role !== 'HR_ADMIN') {
        console.log('🔄 Updating role to HR_ADMIN...');
        const updatedUser = await prisma.user.update({
          where: { email: existingUser.email },
          data: { role: 'HR_ADMIN' }
        });
        console.log('✅ Successfully updated to HR_ADMIN');
      } else {
        console.log('✅ Already has HR_ADMIN role');
      }
    } else {
      console.log('❌ Marcia Stanisclaus not found in database');
    }

  } catch (error) {
    console.error('❌ Error checking Marcia user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarciaUser();
