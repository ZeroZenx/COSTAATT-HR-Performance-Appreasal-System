const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAlvinelleAdmin() {
  try {
    console.log('🔧 Updating Alvinelle Matthew to admin with correct email...\n');

    // Update Alvinelle Matthew's role to HR_ADMIN and email
    const alvinelleUpdate = await prisma.user.update({
      where: { email: 'amatthew@costaatt.edu.tt' },
      data: { 
        role: 'HR_ADMIN',
        email: 'AMatthew@costaatt.edu.tt',
        title: 'Vice President Human Resources',
        dept: 'Human Resources'
      }
    });
    
    console.log('✅ Updated Alvinelle Matthew:');
    console.log(`   📧 Email: ${alvinelleUpdate.email}`);
    console.log(`   👤 Name: ${alvinelleUpdate.firstName} ${alvinelleUpdate.lastName}`);
    console.log(`   👤 Role: ${alvinelleUpdate.role}`);
    console.log(`   🏢 Title: ${alvinelleUpdate.title}`);
    console.log(`   🏬 Department: ${alvinelleUpdate.dept}`);

    // Verify Marcia Stanisclaus is already correct
    console.log('\n🔍 Verifying Marcia Stanisclaus...');
    const marcia = await prisma.user.findUnique({
      where: { email: 'MStanisclaus@costaatt.edu.tt' }
    });
    
    if (marcia) {
      console.log('✅ Marcia Stanisclaus is already correctly configured:');
      console.log(`   📧 Email: ${marcia.email}`);
      console.log(`   👤 Name: ${marcia.firstName} ${marcia.lastName}`);
      console.log(`   👤 Role: ${marcia.role}`);
      console.log(`   🏢 Title: ${marcia.title}`);
    }

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
      }
    });

    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error updating Alvinelle:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAlvinelleAdmin();
