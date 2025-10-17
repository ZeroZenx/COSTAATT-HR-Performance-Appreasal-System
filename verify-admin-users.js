const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAdminUsers() {
  try {
    console.log('🔍 Checking admin users...\n');

    const adminUsers = await prisma.user.findMany({
      where: { role: 'HR_ADMIN' },
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

    console.log(`📊 Found ${adminUsers.length} admin user(s):\n`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   🏬 Department: ${user.dept}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminUsers();
