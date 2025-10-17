const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupDeborahDualRoles() {
  try {
    // Find Deborah Romero
    const deborah = await prisma.user.findUnique({
      where: { email: 'dromero@costaatt.edu.tt' },
      include: { userRoles: true }
    });

    if (!deborah) {
      console.log('Deborah Romero not found.');
      return;
    }

    console.log('=== SETTING UP DEBORAH ROMERO DUAL ROLES ===');
    console.log('Found Deborah:', deborah.email);
    console.log('Current role:', deborah.role);
    console.log('Current assigned roles:', deborah.userRoles ? deborah.userRoles.map(ur => ur.role) : 'none');

    // Clear existing role assignments
    await prisma.userRoleAssignment.deleteMany({
      where: { userId: deborah.id }
    });

    // Add dual roles: SUPERVISOR and EMPLOYEE
    await prisma.userRoleAssignment.createMany({
      data: [
        { userId: deborah.id, role: 'SUPERVISOR' },
        { userId: deborah.id, role: 'EMPLOYEE' }
      ]
    });

    // Verify the update
    const verifyDeborah = await prisma.user.findUnique({
      where: { id: deborah.id },
      include: {
        userRoles: true,
        employee: true
      }
    });

    console.log('\n=== VERIFICATION ===');
    console.log('ID:', verifyDeborah.id);
    console.log('Name:', verifyDeborah.firstName, verifyDeborah.lastName);
    console.log('Email:', verifyDeborah.email);
    console.log('Primary Role:', verifyDeborah.role);
    console.log('Assigned Roles:', verifyDeborah.userRoles.map(ur => ur.role));
    console.log('Has Employee Record:', !!verifyDeborah.employee);

    console.log('\n✅ Deborah Romero now has dual roles: SUPERVISOR and EMPLOYEE');
    console.log('✅ She can now supervise others AND be supervised herself');

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDeborahDualRoles();
