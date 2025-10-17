const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAppraisalCycle() {
  try {
    console.log('🔧 Creating appraisal cycle...');

    // Create the 2025 Annual Performance Review cycle
    const cycle = await prisma.appraisalCycle.create({
      data: {
        name: '2025 Annual Performance Review',
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-12-31'),
        status: 'PLANNED'
      }
    });

    console.log(`✅ Created/Updated appraisal cycle: ${cycle.name}`);
    console.log('📅 Period: Jan 1, 2025 – Dec 31, 2025');
    console.log('🏷️ Status: PLANNED');

  } catch (error) {
    console.error('❌ Error creating appraisal cycle:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAppraisalCycle();
