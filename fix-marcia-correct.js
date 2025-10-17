const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMarciaCorrect() {
  try {
    console.log('🔧 Fixing Marcia Stanisclaus records...\n');

    // Update the HR_ADMIN Marcia to have the correct email
    const marciaUpdate = await prisma.user.update({
      where: { email: 'Mlalla@costaatt.edu.tt' },
      data: { 
        email: 'MStanisclaus@costaatt.edu.tt',
        title: 'Director, Planning and Employment',
        dept: 'Human Resources'
      }
    });
    
    console.log('✅ Updated HR_ADMIN Marcia Stanisclaus:');
    console.log(`   📧 Email: ${marciaUpdate.email}`);
    console.log(`   👤 Name: ${marciaUpdate.firstName} ${marciaUpdate.lastName}`);
    console.log(`   👤 Role: ${marciaUpdate.role}`);
    console.log(`   🏢 Title: ${marciaUpdate.title}`);
    console.log(`   🏬 Department: ${marciaUpdate.dept}`);

    // Delete the duplicate SUPERVISOR record
    console.log('\n🗑️ Removing duplicate SUPERVISOR record...');
    const deleteResult = await prisma.user.delete({
      where: { email: 'mstanisclaus@costaatt.edu.tt' }
    });
    
    console.log('✅ Deleted duplicate record:');
    console.log(`   📧 Email: ${deleteResult.email}`);
    console.log(`   👤 Name: ${deleteResult.firstName} ${deleteResult.lastName}`);

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
    console.error('❌ Error fixing Marcia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMarciaCorrect();
