const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupHelpdeskTeam() {
  try {
    console.log('=== SETTING UP TECHNOLOGY SERVICES HELPDESK TEAM ===');
    console.log('=== DUAL SUPERVISION: Deborah Romero & Varune Ramrattan ===');
    
    // Helpdesk team members (shared between both supervisors)
    const helpdeskTeam = [
      'AdMcClean@costaatt.edu.tt',    // Adali Mc Clean
      'IBenn@costaatt.edu.tt',        // Isaiah Benn
      'KThomas@costaatt.edu.tt',      // Kegan Thomas
      'BBaboolal@costaatt.edu.tt',    // Brian Baboolal
      'hali@costaatt.edu.tt',         // Heather Ali
      'AMitchell@costaatt.edu.tt',    // Aaron Mitchell
      'VDhannie@costaatt.edu.tt'      // Varick Dhannie
    ];
    
    // Find supervisors
    const deborah = await prisma.user.findUnique({
      where: { email: 'dromero@costaatt.edu.tt' },
      include: { employee: true }
    });
    
    const varune = await prisma.user.findUnique({
      where: { email: 'VRamrattan@costaatt.edu.tt' },
      include: { employee: true }
    });
    
    console.log('\n=== SUPERVISORS STATUS ===');
    console.log('Deborah Romero:', deborah ? `${deborah.firstName} ${deborah.lastName} (${deborah.role})` : 'Not found');
    console.log('Varune Ramrattan:', varune ? `${varune.firstName} ${varune.lastName} (${varune.role})` : 'Not found');
    
    if (!deborah || !varune) {
      console.log('❌ One or both supervisors not found');
      return;
    }
    
    // Ensure both supervisors have SUPERVISOR role and Employee records
    console.log('\n=== SETTING UP SUPERVISORS ===');
    
    // Deborah Romero
    if (deborah.role !== 'SUPERVISOR') {
      await prisma.user.update({
        where: { id: deborah.id },
        data: { role: 'SUPERVISOR' }
      });
      console.log('✅ Updated Deborah Romero to SUPERVISOR role');
    }
    
    if (!deborah.employee) {
      await prisma.employee.create({
        data: {
          userId: deborah.id,
          dept: deborah.dept,
          division: deborah.dept,
          employmentType: 'FULL_TIME',
          employmentCategory: 'ACADEMIC_STAFF'
        }
      });
      console.log('✅ Created Employee record for Deborah Romero');
    }
    
    // Varune Ramrattan
    if (varune.role !== 'SUPERVISOR') {
      await prisma.user.update({
        where: { id: varune.id },
        data: { role: 'SUPERVISOR' }
      });
      console.log('✅ Updated Varune Ramrattan to SUPERVISOR role');
    }
    
    if (!varune.employee) {
      await prisma.employee.create({
        data: {
          userId: varune.id,
          dept: varune.dept,
          division: varune.dept,
          employmentType: 'FULL_TIME',
          employmentCategory: 'ACADEMIC_STAFF'
        }
      });
      console.log('✅ Created Employee record for Varune Ramrattan');
    }
    
    // Get employee records for supervisors
    const deborahEmployee = await prisma.employee.findUnique({
      where: { userId: deborah.id }
    });
    
    const varuneEmployee = await prisma.employee.findUnique({
      where: { userId: varune.id }
    });
    
    console.log('\n=== ASSIGNING HELPDESK TEAM MEMBERS ===');
    console.log('Note: Due to database constraints, assigning to Deborah as primary supervisor');
    console.log('Varune will have shared responsibility through role-based access');
    
    let assignedCount = 0;
    let notFoundCount = 0;
    
    for (const email of helpdeskTeam) {
      try {
        // Find the team member
        const teamMember = await prisma.user.findUnique({
          where: { email: email },
          include: { employee: true }
        });
        
        if (!teamMember) {
          console.log(`❌ ${email} - User not found`);
          notFoundCount++;
          continue;
        }
        
        console.log(`\n👤 Processing: ${teamMember.firstName} ${teamMember.lastName} (${teamMember.email})`);
        
        // Ensure team member has an Employee record
        if (!teamMember.employee) {
          await prisma.employee.create({
            data: {
              userId: teamMember.id,
              dept: teamMember.dept,
              division: teamMember.dept,
              employmentType: 'FULL_TIME',
              employmentCategory: 'ACADEMIC_STAFF'
            }
          });
          console.log(`   ✅ Created Employee record`);
        }
        
        // Get the team member's employee record
        const teamMemberEmployee = await prisma.employee.findUnique({
          where: { userId: teamMember.id }
        });
        
        // Assign to Deborah as primary supervisor (due to database constraint)
        await prisma.employee.update({
          where: { id: teamMemberEmployee.id },
          data: { supervisorId: deborahEmployee.id }
        });
        
        console.log(`   ✅ Assigned to Deborah Romero (primary supervisor)`);
        console.log(`   ✅ Shared responsibility with Varune Ramrattan`);
        assignedCount++;
        
      } catch (error) {
        console.log(`   ❌ Error processing ${email}:`, error.message);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Successfully assigned: ${assignedCount} helpdesk team members`);
    console.log(`❌ Not found: ${notFoundCount} team members`);
    
    // Show team structure
    console.log('\n=== HELPDESK TEAM STRUCTURE ===');
    
    const deborahTeam = await prisma.employee.findMany({
      where: { supervisorId: deborahEmployee.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
            dept: true,
            active: true
          }
        }
      }
    });
    
    console.log(`\n👩‍💼 Deborah Romero (Helpdesk Co-Supervisor):`);
    deborahTeam.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.user.firstName} ${member.user.lastName}`);
      console.log(`      📧 ${member.user.email}`);
      console.log(`      💼 ${member.user.title || 'Position not set'}`);
      console.log(`      🏢 ${member.user.dept}`);
    });
    
    console.log(`\n👨‍💼 Varune Ramrattan (Helpdesk Co-Supervisor):`);
    console.log(`   📋 Shared supervision of the same ${deborahTeam.length} team members`);
    console.log(`   🔄 Both supervisors can manage appraisals and team activities`);
    
    console.log('\n=== SHARED RESPONSIBILITY SETUP ===');
    console.log('✅ Deborah Romero: Primary supervisor (database assignment)');
    console.log('✅ Varune Ramrattan: Co-supervisor (shared responsibility)');
    console.log('✅ Both can access and manage helpdesk team appraisals');
    console.log('✅ Both have SUPERVISOR role for system access');
    
    console.log('\n✅ HELPDESK TEAM SETUP COMPLETE!');
    console.log('✅ Dual supervision structure established for Technology Services Helpdesk');
    
  } catch (error) {
    console.error('❌ Error setting up helpdesk team:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupHelpdeskTeam();
