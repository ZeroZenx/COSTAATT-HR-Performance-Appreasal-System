const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAppraisalCycles() {
  try {
    console.log('🔧 Fixing appraisal cycles...');

    // Update the existing cycle with correct dates
    const updatedCycle = await prisma.appraisalCycle.updateMany({
      where: {
        name: {
          contains: '2025'
        }
      },
      data: {
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-12-31'),
        status: 'PLANNED'
      }
    });

    console.log(`✅ Updated ${updatedCycle.count} appraisal cycles`);
    console.log('📅 Set correct dates: Jan 1, 2025 – Dec 31, 2025');
    console.log('🏷️ Status: PLANNED');

  } catch (error) {
    console.error('❌ Error fixing appraisal cycles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAppraisalCycles();

