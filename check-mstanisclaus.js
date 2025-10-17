const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMStanisclaus() {
  try {
    console.log('🔍 Checking who has MStanisclaus@costaatt.edu.tt...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'MStanisclaus@costaatt.edu.tt' },
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

    if (user) {
      console.log('✅ Found user with MStanisclaus@costaatt.edu.tt:');
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Name: ${user.firstName} ${user.lastName}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   🏬 Department: ${user.dept}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}`);
      
      // Update this user to be HR_ADMIN if they're Marcia
      if (user.firstName === 'Marcia' && user.lastName === 'Stanisclaus') {
        console.log('\n🔄 Updating Marcia to HR_ADMIN...');
        const updated = await prisma.user.update({
          where: { email: 'MStanisclaus@costaatt.edu.tt' },
          data: {
            role: 'HR_ADMIN',
            title: 'Director, Planning and Employment',
            dept: 'Human Resources'
          }
        });
        console.log('✅ Updated Marcia Stanisclaus to HR_ADMIN');
      }
    } else {
      console.log('❌ No user found with MStanisclaus@costaatt.edu.tt');
    }

    // Also check the old email
    console.log('\n🔍 Checking Mlalla@costaatt.edu.tt...\n');
    const oldUser = await prisma.user.findUnique({
      where: { email: 'Mlalla@costaatt.edu.tt' },
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

    if (oldUser) {
      console.log('✅ Found user with Mlalla@costaatt.edu.tt:');
      console.log(`   📧 Email: ${oldUser.email}`);
      console.log(`   👤 Name: ${oldUser.firstName} ${oldUser.lastName}`);
      console.log(`   👤 Role: ${oldUser.role}`);
      console.log(`   🏢 Title: ${oldUser.title}`);
      console.log(`   🏬 Department: ${oldUser.dept}`);
      console.log(`   ✅ Active: ${oldUser.active ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ No user found with Mlalla@costaatt.edu.tt');
    }

  } catch (error) {
    console.error('❌ Error checking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMStanisclaus();
