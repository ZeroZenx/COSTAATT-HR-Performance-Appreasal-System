const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupComplexHierarchy() {
  try {
    console.log('=== SETTING UP COMPLEX ORGANIZATIONAL HIERARCHY ===');
    
    // Find all key personnel
    const alvinelle = await prisma.user.findUnique({
      where: { email: 'AMatthew@costaatt.edu.tt' },
      include: { employee: true }
    });
    
    const marcia = await prisma.user.findUnique({
      where: { email: 'MStanisclaus@costaatt.edu.tt' },
      include: { employee: true }
    });
    
    const keith = await prisma.user.findUnique({
      where: { email: 'knurse@costaatt.edu.tt' },
      include: { employee: true }
    });
    
    console.log('\n=== KEY PERSONNEL STATUS ===');
    console.log('Alvinelle Matthew:', alvinelle ? `${alvinelle.firstName} ${alvinelle.lastName} (${alvinelle.role})` : 'Not found');
    console.log('Marcia Stanisclaus:', marcia ? `${marcia.firstName} ${marcia.lastName} (${marcia.role})` : 'Not found');
    console.log('Keith Nurse:', keith ? `${keith.firstName} ${keith.lastName} (${keith.role})` : 'Not found');
    
    if (!alvinelle || !marcia || !keith) {
      console.log('❌ One or more key personnel not found');
      return;
    }
    
    // Step 1: Set up Alvinelle Matthew (Admin + FINAL_APPROVER + Supervisor)
    console.log('\n=== STEP 1: SETTING UP ALVINELLE MATTHEW ===');
    
    // Update Alvinelle's role to FINAL_APPROVER (highest level)
    if (alvinelle.role !== 'FINAL_APPROVER') {
      await prisma.user.update({
        where: { id: alvinelle.id },
        data: { role: 'FINAL_APPROVER' }
      });
      console.log('✅ Updated Alvinelle to FINAL_APPROVER role');
    }
    
    // Ensure Alvinelle has Employee record
    if (!alvinelle.employee) {
      await prisma.employee.create({
        data: {
          userId: alvinelle.id,
          dept: alvinelle.dept,
          division: alvinelle.dept,
          employmentType: 'FULL_TIME',
          employmentCategory: 'ACADEMIC_STAFF'
        }
      });
      console.log('✅ Created Employee record for Alvinelle');
    }
    
    // Step 2: Set up Marcia Stanisclaus (Admin + Supervisor)
    console.log('\n=== STEP 2: SETTING UP MARCIA STANISCLAUS ===');
    
    // Ensure Marcia has Employee record
    if (!marcia.employee) {
      await prisma.employee.create({
        data: {
          userId: marcia.id,
          dept: marcia.dept,
          division: marcia.dept,
          employmentType: 'FULL_TIME',
          employmentCategory: 'ACADEMIC_STAFF'
        }
      });
      console.log('✅ Created Employee record for Marcia');
    }
    
    // Get employee records
    const alvinelleEmployee = await prisma.employee.findUnique({
      where: { userId: alvinelle.id }
    });
    
    const marciaEmployee = await prisma.employee.findUnique({
      where: { userId: marcia.id }
    });
    
    // Step 3: Set up Alvinelle's direct reports
    console.log('\n=== STEP 3: SETTING UP ALVINELLE\'S DIRECT REPORTS ===');
    
    const alvinelleTeam = [
      'MStanisclaus@costaatt.edu.tt',  // Marcia Stanisclaus
      'LJunkere@costaatt.edu.tt',      // Liselle Junkere
      'SHosein@costaatt.edu.tt'        // Saleem Hosein
    ];
    
    let alvinelleAssigned = 0;
    
    for (const email of alvinelleTeam) {
      try {
        const teamMember = await prisma.user.findUnique({
          where: { email: email },
          include: { employee: true }
        });
        
        if (!teamMember) {
          console.log(`❌ ${email} - User not found`);
          continue;
        }
        
        // Ensure team member has Employee record
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
        }
        
        const teamMemberEmployee = await prisma.employee.findUnique({
          where: { userId: teamMember.id }
        });
        
        // Assign to Alvinelle
        await prisma.employee.update({
          where: { id: teamMemberEmployee.id },
          data: { supervisorId: alvinelleEmployee.id }
        });
        
        console.log(`✅ ${teamMember.firstName} ${teamMember.lastName} assigned to Alvinelle`);
        alvinelleAssigned++;
        
      } catch (error) {
        console.log(`❌ Error processing ${email}:`, error.message);
      }
    }
    
    // Step 4: Set up Marcia's direct reports
    console.log('\n=== STEP 4: SETTING UP MARCIA\'S DIRECT REPORTS ===');
    
    const marciaTeam = [
      'CGirdharry@costaatt.edu.tt',    // Crystal Girdharry
      'EMarildo@costaatt.edu.tt',      // Emmanuel Marildo
      'NHypolite@costaatt.edu.tt',     // Nicolle Hypolite
      'SNoel@costaatt.edu.tt'          // Stacey-Anne Noel
    ];
    
    let marciaAssigned = 0;
    
    for (const email of marciaTeam) {
      try {
        const teamMember = await prisma.user.findUnique({
          where: { email: email },
          include: { employee: true }
        });
        
        if (!teamMember) {
          console.log(`❌ ${email} - User not found`);
          continue;
        }
        
        // Ensure team member has Employee record
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
        }
        
        const teamMemberEmployee = await prisma.employee.findUnique({
          where: { userId: teamMember.id }
        });
        
        // Assign to Marcia
        await prisma.employee.update({
          where: { id: teamMemberEmployee.id },
          data: { supervisorId: marciaEmployee.id }
        });
        
        console.log(`✅ ${teamMember.firstName} ${teamMember.lastName} assigned to Marcia`);
        marciaAssigned++;
        
      } catch (error) {
        console.log(`❌ Error processing ${email}:`, error.message);
      }
    }
    
    // Final verification and summary
    console.log('\n=== ORGANIZATIONAL HIERARCHY SUMMARY ===');
    
    const alvinelleTeamFinal = await prisma.employee.findMany({
      where: { supervisorId: alvinelleEmployee.id },
      include: { user: true }
    });
    
    const marciaTeamFinal = await prisma.employee.findMany({
      where: { supervisorId: marciaEmployee.id },
      include: { user: true }
    });
    
    console.log('\n📊 COMPLETE ORGANIZATIONAL STRUCTURE:');
    console.log(`\n👑 Keith Nurse (FINAL_APPROVER) - President & Final Approver`);
    console.log(`   ↓ (Final Approval for all)`);
    
    console.log(`\n👑 Alvinelle Matthew (FINAL_APPROVER + Admin) - Senior Leadership`);
    console.log(`   ├── Marcia Stanisclaus (HR_ADMIN + Supervisor)`);
    console.log(`   ├── Liselle Junkere`);
    console.log(`   └── Saleem Hosein`);
    console.log(`   📊 Direct Reports: ${alvinelleTeamFinal.length}`);
    
    console.log(`\n👩‍💼 Marcia Stanisclaus (HR_ADMIN + Supervisor) - Department Head`);
    console.log(`   ├── Crystal Girdharry`);
    console.log(`   ├── Emmanuel Marildo`);
    console.log(`   ├── Nicolle Hypolite`);
    console.log(`   └── Stacey-Anne Noel`);
    console.log(`   📊 Direct Reports: ${marciaTeamFinal.length}`);
    
    console.log('\n🔄 APPROVAL FLOWS:');
    console.log('   • Marcia\'s Team → Marcia (review) → Keith (final approval)');
    console.log('   • Alvinelle\'s Direct Reports → Alvinelle (review) → Keith (final approval)');
    console.log('   • Marcia → Alvinelle (review) → Keith (final approval)');
    console.log('   • Alvinelle → Keith (final approval)');
    
    console.log('\n✅ COMPLEX HIERARCHY SETUP COMPLETE!');
    console.log('✅ Multiple admin supervisors with dual roles established');
    console.log('✅ Proper approval chains configured');
    
  } catch (error) {
    console.error('❌ Error setting up complex hierarchy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupComplexHierarchy();
