const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function addMissingEmployees() {
  console.log('🔄 Adding missing employees: Varune Ramrattan and Varick Dhannie...');
  
  try {
    // Add Varune Ramrattan
    console.log('Adding Varune Ramrattan...');
    const varuneUser = await prisma.user.create({
      data: {
        email: 'vramrattan@costaatt.edu.tt',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'SUPERVISOR',
        firstName: 'Varune',
        lastName: 'Ramrattan',
        dept: 'Academic Affairs',
        title: 'Dean of Academic Affairs',
        active: true
      }
    });

    const varuneEmployee = await prisma.employee.create({
      data: {
        userId: varuneUser.id,
        dept: 'Academic Affairs',
        division: 'Academic Affairs',
        employmentType: 'Full-time',
        employmentCategory: 'EXECUTIVE',
        contractStartDate: new Date('2020-01-01'),
        contractEndDate: new Date('2025-12-31'),
        expectedAppraisalMonth: 'December',
        expectedAppraisalDay: 31
      }
    });

    console.log('✅ Added Varune Ramrattan:', varuneUser.email);

    // Add Varick Dhannie
    console.log('Adding Varick Dhannie...');
    const varickUser = await prisma.user.create({
      data: {
        email: 'vdhannie@costaatt.edu.tt',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'EMPLOYEE',
        firstName: 'Varick',
        lastName: 'Dhannie',
        dept: 'Information Technology',
        title: 'IT Support Specialist',
        active: true
      }
    });

    const varickEmployee = await prisma.employee.create({
      data: {
        userId: varickUser.id,
        dept: 'Information Technology',
        division: 'Administrative Services',
        employmentType: 'Full-time',
        employmentCategory: 'GENERAL_STAFF',
        contractStartDate: new Date('2021-06-01'),
        contractEndDate: new Date('2024-05-31'),
        expectedAppraisalMonth: 'May',
        expectedAppraisalDay: 31
      }
    });

    console.log('✅ Added Varick Dhannie:', varickUser.email);

    // Verify they were added
    const addedVarune = await prisma.employee.findFirst({
      where: {
        user: {
          OR: [
            { firstName: { contains: 'Varune', mode: 'insensitive' } },
            { lastName: { contains: 'Ramrattan', mode: 'insensitive' } }
          ]
        }
      },
      include: { user: true }
    });

    const addedVarick = await prisma.employee.findFirst({
      where: {
        user: {
          OR: [
            { firstName: { contains: 'Varick', mode: 'insensitive' } },
            { lastName: { contains: 'Dhannie', mode: 'insensitive' } }
          ]
        }
      },
      include: { user: true }
    });

    console.log('\n🔍 Verification:');
    console.log(`Varune Ramrattan: ${addedVarune ? `✅ Found (${addedVarune.user.firstName} ${addedVarune.user.lastName})` : '❌ Not found'}`);
    console.log(`Varick Dhannie: ${addedVarick ? `✅ Found (${addedVarick.user.firstName} ${addedVarick.user.lastName})` : '❌ Not found'}`);

    console.log('\n✅ Successfully added missing employees!');

  } catch (error) {
    console.error('❌ Error adding employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingEmployees();
