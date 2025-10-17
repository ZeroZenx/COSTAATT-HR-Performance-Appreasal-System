const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupAdmissionsRegistryTeams() {
  try {
    console.log('=== SETTING UP ADMISSIONS & REGISTRY TEAMS ===');
    
    // Find key personnel
    const helen = await prisma.user.findUnique({
      where: { email: 'hcumberbatch@costaatt.edu.tt' },
      include: { employee: true }
    });
    
    const rhonda = await prisma.user.findUnique({
      where: { email: 'RCumberbatch@costaatt.edu.tt' },
      include: { employee: true }
    });
    
    const reynela = await prisma.user.findUnique({
      where: { email: 'RGAlvarez@costaatt.edu.tt' },
      include: { employee: true }
    });
    
    console.log('\n=== KEY PERSONNEL STATUS ===');
    console.log('Helen Williams-Cumberbatch:', helen ? `${helen.firstName} ${helen.lastName} (${helen.role})` : 'Not found');
    console.log('Rhonda Cumberbatch:', rhonda ? `${rhonda.firstName} ${rhonda.lastName} (${rhonda.role})` : 'Not found');
    console.log('Reynela Gilkes-Alvarez:', reynela ? `${reynela.firstName} ${reynela.lastName} (${reynela.role})` : 'Not found');
    
    if (!helen || !rhonda || !reynela) {
      console.log('❌ One or more key personnel not found');
      return;
    }
    
    // Step 1: Set up Helen Williams-Cumberbatch (Final Approver)
    console.log('\n=== STEP 1: SETTING UP HELEN WILLIAMS-CUMBERBATCH ===');
    
    if (helen.role !== 'FINAL_APPROVER') {
      await prisma.user.update({
        where: { id: helen.id },
        data: { role: 'FINAL_APPROVER' }
      });
      console.log('✅ Updated Helen to FINAL_APPROVER role');
    }
    
    if (!helen.employee) {
      await prisma.employee.create({
        data: {
          userId: helen.id,
          dept: helen.dept,
          division: helen.dept,
          employmentType: 'FULL_TIME',
          employmentCategory: 'ACADEMIC_STAFF'
        }
      });
      console.log('✅ Created Employee record for Helen');
    }
    
    // Step 2: Set up Rhonda Cumberbatch (Registry Head)
    console.log('\n=== STEP 2: SETTING UP RHONDA CUMBERBATCH (REGISTRY HEAD) ===');
    
    if (rhonda.role !== 'SUPERVISOR') {
      await prisma.user.update({
        where: { id: rhonda.id },
        data: { role: 'SUPERVISOR' }
      });
      console.log('✅ Updated Rhonda to SUPERVISOR role');
    }
    
    if (!rhonda.employee) {
      await prisma.employee.create({
        data: {
          userId: rhonda.id,
          dept: rhonda.dept,
          division: rhonda.dept,
          employmentType: 'FULL_TIME',
          employmentCategory: 'ACADEMIC_STAFF'
        }
      });
      console.log('✅ Created Employee record for Rhonda');
    }
    
    // Step 3: Set up Reynela Gilkes-Alvarez (Admissions Head)
    console.log('\n=== STEP 3: SETTING UP REYNELA GILKES-ALVAREZ (ADMISSIONS HEAD) ===');
    
    if (reynela.role !== 'SUPERVISOR') {
      await prisma.user.update({
        where: { id: reynela.id },
        data: { role: 'SUPERVISOR' }
      });
      console.log('✅ Updated Reynela to SUPERVISOR role');
    }
    
    if (!reynela.employee) {
      await prisma.employee.create({
        data: {
          userId: reynela.id,
          dept: reynela.dept,
          division: reynela.dept,
          employmentType: 'FULL_TIME',
          employmentCategory: 'ACADEMIC_STAFF'
        }
      });
      console.log('✅ Created Employee record for Reynela');
    }
    
    // Get employee records
    const helenEmployee = await prisma.employee.findUnique({
      where: { userId: helen.id }
    });
    
    const rhondaEmployee = await prisma.employee.findUnique({
      where: { userId: rhonda.id }
    });
    
    const reynelaEmployee = await prisma.employee.findUnique({
      where: { userId: reynela.id }
    });
    
    // Step 4: Assign department heads to Helen
    console.log('\n=== STEP 4: ASSIGNING DEPARTMENT HEADS TO HELEN ===');
    
    // Assign Rhonda to Helen
    await prisma.employee.update({
      where: { id: rhondaEmployee.id },
      data: { supervisorId: helenEmployee.id }
    });
    console.log('✅ Rhonda Cumberbatch assigned to Helen Williams-Cumberbatch');
    
    // Assign Reynela to Helen
    await prisma.employee.update({
      where: { id: reynelaEmployee.id },
      data: { supervisorId: helenEmployee.id }
    });
    console.log('✅ Reynela Gilkes-Alvarez assigned to Helen Williams-Cumberbatch');
    
    // Step 5: Set up Registry Team
    console.log('\n=== STEP 5: SETTING UP REGISTRY TEAM ===');
    
    const registryTeam = [
      'gking@costaatt.edu.tt',        // Gwyneth King
      'kmadoo@costaatt.edu.tt',       // Karen Madoo
      'kpope@costaatt.edu.tt',        // Kellyann Pope
      'KBanfield@costaatt.edu.tt',    // Kempson Banfield
      'KRiley@costaatt.edu.tt',       // Kinda Riley
      'LSandiford@costaatt.edu.tt',   // Lea-Andro Sandiford
      'MRagoopath@costaatt.edu.tt',   // Maltie Ragoopath
      'NiThomas@costaatt.edu.tt',     // Nigel Thomas
      'NHobson@costaatt.edu.tt',      // Nkese Hobson
      'ZMollick@costaatt.edu.tt'      // Zalina Mollick
    ];
    
    let registryAssigned = 0;
    
    for (const email of registryTeam) {
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
        
        // Assign to Rhonda
        await prisma.employee.update({
          where: { id: teamMemberEmployee.id },
          data: { supervisorId: rhondaEmployee.id }
        });
        
        console.log(`✅ ${teamMember.firstName} ${teamMember.lastName} assigned to Registry team`);
        registryAssigned++;
        
      } catch (error) {
        console.log(`❌ Error processing ${email}:`, error.message);
      }
    }
    
    // Step 6: Set up Admissions Team
    console.log('\n=== STEP 6: SETTING UP ADMISSIONS TEAM ===');
    
    const admissionsTeam = [
      'AMohammed@costaatt.edu.tt',    // Aaron Mohammed
      'AVillafana@costaatt.edu.tt',   // Abigail Villafana
      'cctrancoso@costaatt.edu.tt',   // Carol County Trancoso
      'CPascall@costaatt.edu.tt',     // Carrissa Pascall
      'CMorris@costaatt.edu.tt',      // Cindy Morris
      'ecamps@costaatt.edu.tt',       // Erin Camps
      'JDurham@costaatt.edu.tt',      // Jenna Durham
      'KKennedy@costaatt.edu.tt',     // Kevon Kennedy
      'LPrevatt@costaatt.edu.tt',     // Liselle Prevatt
      'MPollard@costaatt.edu.tt',     // Marvin Pollard
      'MIAlexander@costaatt.edu.tt',  // Mitzy Alexander
      'NFranco@costaatt.edu.tt',      // Natalie Franco
      'TMiller@costaatt.edu.tt'       // Tanasha Miller
    ];
    
    let admissionsAssigned = 0;
    
    for (const email of admissionsTeam) {
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
        
        // Assign to Reynela
        await prisma.employee.update({
          where: { id: teamMemberEmployee.id },
          data: { supervisorId: reynelaEmployee.id }
        });
        
        console.log(`✅ ${teamMember.firstName} ${teamMember.lastName} assigned to Admissions team`);
        admissionsAssigned++;
        
      } catch (error) {
        console.log(`❌ Error processing ${email}:`, error.message);
      }
    }
    
    // Final verification and summary
    console.log('\n=== ORGANIZATIONAL HIERARCHY SUMMARY ===');
    
    const helenTeam = await prisma.employee.findMany({
      where: { supervisorId: helenEmployee.id },
      include: { user: true }
    });
    
    const rhondaTeam = await prisma.employee.findMany({
      where: { supervisorId: rhondaEmployee.id },
      include: { user: true }
    });
    
    const reynelaTeam = await prisma.employee.findMany({
      where: { supervisorId: reynelaEmployee.id },
      include: { user: true }
    });
    
    console.log('\n📊 ADMISSIONS & REGISTRY ORGANIZATIONAL STRUCTURE:');
    console.log(`\n👑 Helen Williams-Cumberbatch (FINAL_APPROVER) - Senior Leadership`);
    console.log(`   ├── Rhonda Cumberbatch (SUPERVISOR) - Registry Head`);
    console.log(`   └── Reynela Gilkes-Alvarez (SUPERVISOR) - Admissions Head`);
    console.log(`   📊 Direct Reports: ${helenTeam.length}`);
    
    console.log(`\n📚 REGISTRY TEAM (${rhondaTeam.length} members):`);
    console.log(`   👩‍💼 Rhonda Cumberbatch (Head)`);
    rhondaTeam.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.user.firstName} ${member.user.lastName}`);
    });
    
    console.log(`\n📝 ADMISSIONS TEAM (${reynelaTeam.length} members):`);
    console.log(`   👩‍💼 Reynela Gilkes-Alvarez (Head)`);
    reynelaTeam.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.user.firstName} ${member.user.lastName}`);
    });
    
    console.log('\n🔄 APPROVAL FLOWS:');
    console.log('   • Registry Team → Rhonda (review) → Helen (final approval)');
    console.log('   • Admissions Team → Reynela (review) → Helen (final approval)');
    console.log('   • Rhonda → Helen (final approval)');
    console.log('   • Reynela → Helen (final approval)');
    
    console.log('\n✅ ADMISSIONS & REGISTRY TEAMS SETUP COMPLETE!');
    console.log(`✅ Registry Team: ${registryAssigned} members assigned`);
    console.log(`✅ Admissions Team: ${admissionsAssigned} members assigned`);
    console.log('✅ Helen Williams-Cumberbatch is final approver for both teams');
    
  } catch (error) {
    console.error('❌ Error setting up Admissions & Registry teams:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmissionsRegistryTeams();
