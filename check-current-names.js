const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentNames() {
  try {
    console.log('🔍 Checking current user names in database...\n');

    // Check for users with similar names
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: 'Alvinelle' } },
          { firstName: { contains: 'Marcia' } },
          { lastName: { contains: 'Matthew' } },
          { lastName: { contains: 'Stanisclaus' } }
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

    console.log(`📊 Found ${users.length} matching user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error checking names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentNames();
