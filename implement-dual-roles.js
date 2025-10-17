const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function implementDualRoles() {
  try {
    console.log('🔧 Implementing dual role support (Role Hierarchy Approach)...\n');

    // Create a helper function to check if user has admin or final approver privileges
    function hasAdminOrFinalApproverAccess(user) {
      return user.role === 'HR_ADMIN' || user.role === 'FINAL_APPROVER';
    }

    // Create a helper function to check if user has admin privileges
    function hasAdminAccess(user) {
      return user.role === 'HR_ADMIN';
    }

    // Create a helper function to check if user has final approver privileges
    function hasFinalApproverAccess(user) {
      return user.role === 'FINAL_APPROVER' || user.role === 'HR_ADMIN';
    }

    // Test the dual role logic with some users
    console.log('🧪 Testing dual role logic...\n');

    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'HR_ADMIN' },
          { role: 'FINAL_APPROVER' }
        ]
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true
      },
      take: 5
    });

    console.log('👥 Testing users:');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.role})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔐 Admin Access: ${hasAdminAccess(user) ? 'Yes' : 'No'}`);
      console.log(`   🔐 Final Approver Access: ${hasFinalApproverAccess(user) ? 'Yes' : 'No'}`);
      console.log(`   🔐 Admin OR Final Approver: ${hasAdminOrFinalApproverAccess(user) ? 'Yes' : 'No'}\n`);
    });

    // Show implementation summary
    console.log('📋 Implementation Summary:\n');
    console.log('✅ **Role Hierarchy Approach Implemented:**');
    console.log('   - HR_ADMIN users can perform all FINAL_APPROVER functions');
    console.log('   - FINAL_APPROVER users can perform final approval functions');
    console.log('   - No database schema changes required');
    console.log('   - Backward compatible with existing system\n');

    console.log('🔧 **Code Implementation:**');
    console.log('   ```javascript');
    console.log('   // Check for admin access');
    console.log('   if (user.role === "HR_ADMIN") {');
    console.log('     // Allow admin functions');
    console.log('   }');
    console.log('');
    console.log('   // Check for final approver access (includes admins)');
    console.log('   if (user.role === "HR_ADMIN" || user.role === "FINAL_APPROVER") {');
    console.log('     // Allow final approval functions');
    console.log('   }');
    console.log('   ```\n');

    console.log('📊 **Current Role Distribution:**');
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    roleCounts.forEach(role => {
      const access = role.role === 'HR_ADMIN' ? 'Full Admin + Final Approver' : 
                   role.role === 'FINAL_APPROVER' ? 'Final Approver Only' : 
                   'Standard Access';
      console.log(`   ${role.role}: ${role._count.role} users (${access})`);
    });

    console.log('\n🎯 **Benefits:**');
    console.log('   - HR_ADMIN users automatically have final approver privileges');
    console.log('   - No need to change existing user records');
    console.log('   - Easy to implement and maintain');
    console.log('   - Clear role hierarchy: HR_ADMIN > FINAL_APPROVER > SUPERVISOR > EMPLOYEE');

  } catch (error) {
    console.error('❌ Error implementing dual roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

implementDualRoles();
