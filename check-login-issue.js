const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLoginIssue() {
  try {
    console.log('🔍 Checking login issue for amatthew@costaatt.edu.tt...\n');

    // Check if the old email exists
    const oldEmailUser = await prisma.user.findUnique({
      where: { email: 'amatthew@costaatt.edu.tt' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        active: true
      }
    });

    // Check if the new email exists
    const newEmailUser = await prisma.user.findUnique({
      where: { email: 'AMatthew@costaatt.edu.tt' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        active: true
      }
    });

    console.log('📧 Email Check Results:');
    
    if (oldEmailUser) {
      console.log('✅ Found user with OLD email (amatthew@costaatt.edu.tt):');
      console.log(`   👤 Name: ${oldEmailUser.firstName} ${oldEmailUser.lastName}`);
      console.log(`   👤 Role: ${oldEmailUser.role}`);
      console.log(`   ✅ Active: ${oldEmailUser.active ? 'Yes' : 'No'}\n`);
    } else {
      console.log('❌ No user found with OLD email (amatthew@costaatt.edu.tt)\n');
    }

    if (newEmailUser) {
      console.log('✅ Found user with NEW email (AMatthew@costaatt.edu.tt):');
      console.log(`   👤 Name: ${newEmailUser.firstName} ${newEmailUser.lastName}`);
      console.log(`   👤 Role: ${newEmailUser.role}`);
      console.log(`   ✅ Active: ${newEmailUser.active ? 'Yes' : 'No'}\n`);
    } else {
      console.log('❌ No user found with NEW email (AMatthew@costaatt.edu.tt)\n');
    }

    // Show solution
    if (oldEmailUser && !newEmailUser) {
      console.log('🔧 SOLUTION: The email was updated but login is still trying the old email.');
      console.log('   - Use the NEW email: AMatthew@costaatt.edu.tt');
      console.log('   - Password: P@ssw0rd!\n');
    } else if (!oldEmailUser && newEmailUser) {
      console.log('✅ SOLUTION: Use the correct email address.');
      console.log('   - Email: AMatthew@costaatt.edu.tt');
      console.log('   - Password: P@ssw0rd!\n');
    } else if (oldEmailUser && newEmailUser) {
      console.log('⚠️ ISSUE: Both email addresses exist! Need to consolidate.\n');
    }

    // Show all admin users for reference
    console.log('📊 All Admin Users (for reference):');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'HR_ADMIN' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true
      },
      orderBy: { firstName: 'asc' }
    });

    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error checking login issue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLoginIssue();
