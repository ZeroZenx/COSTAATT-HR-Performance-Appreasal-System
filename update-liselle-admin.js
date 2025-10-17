const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLiselleAdmin() {
  try {
    console.log('🔧 Updating Liselle Junkere to admin with correct email...\n');

    // First, check if Liselle exists and what her current role is
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: { contains: 'Liselle' } },
          { lastName: { contains: 'Junkere' } },
          { email: { contains: 'junkere' } }
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
      console.log('✅ Found existing Liselle Junkere:');
      console.log(`   📧 Current Email: ${existingUser.email}`);
      console.log(`   👤 Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`   👤 Current Role: ${existingUser.role}`);
      console.log(`   🏢 Title: ${existingUser.title}`);
      console.log(`   🏬 Department: ${existingUser.dept}`);
      console.log(`   ✅ Active: ${existingUser.active ? 'Yes' : 'No'}\n`);

      // Update her email and role
      const updatedUser = await prisma.user.update({
        where: { email: existingUser.email },
        data: {
          email: 'LJunkere@costaatt.edu.tt',
          role: 'HR_ADMIN',
          title: 'HR Administrator',
          dept: 'Human Resources'
        }
      });

      console.log('✅ Updated Liselle Junkere:');
      console.log(`   📧 New Email: ${updatedUser.email}`);
      console.log(`   👤 Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
      console.log(`   👤 New Role: ${updatedUser.role}`);
      console.log(`   🏢 Title: ${updatedUser.title}`);
      console.log(`   🏬 Department: ${updatedUser.dept}`);

    } else {
      console.log('❌ Liselle Junkere not found in database');
    }

    // Check current role structure
    console.log('\n🔍 Checking current role structure...\n');
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    console.log('📊 Current role distribution:');
    roleCounts.forEach(role => {
      console.log(`   ${role.role}: ${role._count.role} users`);
    });

    // Show final admin list
    console.log('\n📊 Final Admin Users List:\n');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'HR_ADMIN' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        active: true
      },
      orderBy: { firstName: 'asc' }
    });

    console.log(`Found ${adminUsers.length} HR Admin users:\n`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error updating Liselle:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLiselleAdmin();
