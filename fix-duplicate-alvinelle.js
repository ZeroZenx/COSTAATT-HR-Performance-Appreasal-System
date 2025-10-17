const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateAlvinelle() {
  try {
    console.log('🔧 Fixing duplicate Alvinelle Matthew records...\n');

    // Get both records
    const oldRecord = await prisma.user.findUnique({
      where: { email: 'amatthew@costaatt.edu.tt' },
      include: { employee: true }
    });

    const newRecord = await prisma.user.findUnique({
      where: { email: 'AMatthew@costaatt.edu.tt' },
      include: { employee: true }
    });

    console.log('📊 Found Records:');
    console.log(`Old: ${oldRecord ? 'amatthew@costaatt.edu.tt - ' + oldRecord.role : 'Not found'}`);
    console.log(`New: ${newRecord ? 'AMatthew@costaatt.edu.tt - ' + newRecord.role : 'Not found'}\n`);

    if (oldRecord && newRecord) {
      // Delete the old record (keep the new one with capital A)
      console.log('🗑️ Deleting old record (amatthew@costaatt.edu.tt)...');
      
      // First delete associated employee record if it exists
      if (oldRecord.employee) {
        await prisma.employee.delete({
          where: { userId: oldRecord.id }
        });
        console.log('✅ Deleted associated employee record');
      }

      // Delete the old user record
      await prisma.user.delete({
        where: { email: 'amatthew@costaatt.edu.tt' }
      });
      
      console.log('✅ Deleted old user record');
      console.log('✅ Kept new record with correct email: AMatthew@costaatt.edu.tt\n');

    } else if (oldRecord && !newRecord) {
      console.log('⚠️ Only old record exists. Updating email...');
      
      const updated = await prisma.user.update({
        where: { email: 'amatthew@costaatt.edu.tt' },
        data: { email: 'AMatthew@costaatt.edu.tt' }
      });
      
      console.log('✅ Updated email to: AMatthew@costaatt.edu.tt');
    }

    // Verify the fix
    console.log('🔍 Verifying fix...');
    const finalRecord = await prisma.user.findUnique({
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

    if (finalRecord) {
      console.log('✅ SUCCESS! Alvinelle Matthew login fixed:');
      console.log(`   📧 Email: ${finalRecord.email}`);
      console.log(`   👤 Name: ${finalRecord.firstName} ${finalRecord.lastName}`);
      console.log(`   👤 Role: ${finalRecord.role}`);
      console.log(`   🏢 Title: ${finalRecord.title}`);
      console.log(`   ✅ Active: ${finalRecord.active ? 'Yes' : 'No'}\n`);
      
      console.log('🔐 LOGIN CREDENTIALS:');
      console.log('   Email: AMatthew@costaatt.edu.tt');
      console.log('   Password: P@ssw0rd!\n');
    }

    // Check if old email still exists (it shouldn't)
    const oldStillExists = await prisma.user.findUnique({
      where: { email: 'amatthew@costaatt.edu.tt' }
    });

    if (oldStillExists) {
      console.log('⚠️ Old email still exists - manual cleanup needed');
    } else {
      console.log('✅ Old email successfully removed');
    }

  } catch (error) {
    console.error('❌ Error fixing duplicate:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateAlvinelle();
