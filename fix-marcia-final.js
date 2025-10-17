const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMarciaFinal() {
  try {
    console.log('🔧 Updating Marcia Stanisclaus email and role...\n');

    // Update Marcia Stanisclaus's email and ensure she's HR_ADMIN
    const marciaUpdate = await prisma.user.update({
      where: { email: 'Mlalla@costaatt.edu.tt' },
      data: { 
        email: 'MStanisclaus@costaatt.edu.tt',
        role: 'HR_ADMIN',
        title: 'Director, Planning and Employment',
        dept: 'Human Resources'
      }
    });
    
    console.log('✅ Updated Marcia Stanisclaus:');
    console.log(`   📧 Email: ${marciaUpdate.email}`);
    console.log(`   👤 Name: ${marciaUpdate.firstName} ${marciaUpdate.lastName}`);
    console.log(`   👤 Role: ${marciaUpdate.role}`);
    console.log(`   🏢 Title: ${marciaUpdate.title}`);
    console.log(`   🏬 Department: ${marciaUpdate.dept}`);

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
    console.error('❌ Error updating Marcia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMarciaFinal();
