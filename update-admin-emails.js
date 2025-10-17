const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminEmails() {
  try {
    console.log('🔧 Updating admin user email addresses...\n');

    // Update Alvinelle Matthew's email
    console.log('1. Updating Alvinelle Matthew email...');
    const alvinelleUpdate = await prisma.user.updateMany({
      where: { 
        firstName: 'Alvinelle',
        lastName: 'Matthew'
      },
      data: { 
        email: 'AMatthew@costaatt.edu.tt'
      }
    });
    
    if (alvinelleUpdate.count > 0) {
      console.log('✅ Updated Alvinelle Matthew email to: AMatthew@costaatt.edu.tt');
    } else {
      console.log('⚠️  Alvinelle Matthew not found with current name format');
    }

    // Update Marcia Stanisclaus's email
    console.log('\n2. Updating Marcia Stanisclaus email...');
    const marciaUpdate = await prisma.user.updateMany({
      where: { 
        firstName: 'Marcia',
        lastName: 'Stanisclaus'
      },
      data: { 
        email: 'MStanisclaus@costaatt.edu.tt'
      }
    });
    
    if (marciaUpdate.count > 0) {
      console.log('✅ Updated Marcia Stanisclaus email to: MStanisclaus@costaatt.edu.tt');
    } else {
      console.log('⚠️  Marcia Stanisclaus not found with current name format');
    }

    // Verify the updates
    console.log('\n🔍 Verifying updated admin users...\n');
    
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

    console.log(`📊 Found ${adminUsers.length} admin user(s):\n`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error updating admin emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminEmails();
