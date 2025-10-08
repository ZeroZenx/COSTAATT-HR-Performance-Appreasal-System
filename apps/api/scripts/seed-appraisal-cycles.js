const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAppraisalCycles() {
  try {
    console.log('🚀 Starting appraisal cycles seeding...');
    
    // Check existing cycles
    const existingCycles = await prisma.appraisalCycle.findMany();
    console.log(`📊 Found ${existingCycles.length} existing cycles`);
    
    const cycles = [
      {
        name: "Annual Performance Review 2024",
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-12-31'),
        status: 'ACTIVE'
      },
      {
        name: "Mid-Year Review 2024",
        periodStart: new Date('2024-06-01'),
        periodEnd: new Date('2024-08-31'),
        status: 'ACTIVE'
      },
      {
        name: "Annual Performance Review 2025",
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-12-31'),
        status: 'PLANNED'
      }
    ];
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const cycleData of cycles) {
      try {
        // Check if cycle already exists
        const existingCycle = await prisma.appraisalCycle.findFirst({
          where: { 
            name: cycleData.name
          }
        });

        if (existingCycle) {
          // Update existing cycle
          await prisma.appraisalCycle.update({
            where: { id: existingCycle.id },
            data: cycleData
          });
          console.log(`🔄 Updated ${cycleData.name}`);
          updatedCount++;
        } else {
          // Create new cycle
          await prisma.appraisalCycle.create({
            data: cycleData
          });
          console.log(`✅ Created ${cycleData.name}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${cycleData.name}:`, error.message);
      }
    }
    
    console.log('🎉 Appraisal cycles seeding completed!');
    console.log(`📊 Cycles created: ${createdCount}`);
    console.log(`🔄 Cycles updated: ${updatedCount}`);
    
    // Verify cycles
    const allCycles = await prisma.appraisalCycle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log('\n📋 Available cycles:');
    allCycles.forEach(cycle => {
      console.log(`- ${cycle.name} - ${cycle.status}`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedAppraisalCycles();
