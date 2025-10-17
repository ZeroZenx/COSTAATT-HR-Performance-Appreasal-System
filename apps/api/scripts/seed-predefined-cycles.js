const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPredefinedCycles() {
  try {
    console.log('🚀 Starting predefined appraisal cycles seeding...');
    
    // Check existing cycles
    const existingCycles = await prisma.appraisalCycle.findMany();
    console.log(`📊 Found ${existingCycles.length} existing cycles`);
    
    // Predefined cycles as specified in the prompt
    const cycles = [
      {
        id: "cycle-2024a",
        name: "2024 Annual Cycle",
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-12-31'),
        status: 'ACTIVE'
      },
      {
        id: "cycle-2024h2",
        name: "2024 Mid-Year Cycle (H2)",
        periodStart: new Date('2024-07-01'),
        periodEnd: new Date('2024-12-31'),
        status: 'ACTIVE'
      },
      {
        id: "cycle-2025a",
        name: "2025 Annual Cycle",
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-12-31'),
        status: 'PLANNED'
      }
    ];
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const cycleData of cycles) {
      try {
        // Check if cycle already exists by id or name
        const existingCycle = await prisma.appraisalCycle.findFirst({
          where: { 
            OR: [
              { id: cycleData.id },
              { name: cycleData.name }
            ]
          }
        });

        if (existingCycle) {
          // Update existing cycle
          await prisma.appraisalCycle.update({
            where: { id: existingCycle.id },
            data: {
              name: cycleData.name,
              periodStart: cycleData.periodStart,
              periodEnd: cycleData.periodEnd,
              status: cycleData.status
            }
          });
          console.log(`🔄 Updated ${cycleData.name}`);
          updatedCount++;
        } else {
          // Create new cycle
          await prisma.appraisalCycle.create({
            data: {
              id: cycleData.id,
              name: cycleData.name,
              periodStart: cycleData.periodStart,
              periodEnd: cycleData.periodEnd,
              status: cycleData.status
            }
          });
          console.log(`✅ Created ${cycleData.name}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${cycleData.name}:`, error.message);
      }
    }
    
    console.log('🎉 Predefined appraisal cycles seeding completed!');
    console.log(`📊 Cycles created: ${createdCount}`);
    console.log(`🔄 Cycles updated: ${updatedCount}`);
    
    // Verify cycles
    const allCycles = await prisma.appraisalCycle.findMany({
      orderBy: { periodStart: 'desc' }
    });
    console.log('\n📋 Available cycles (sorted by start date descending):');
    allCycles.forEach(cycle => {
      const startDate = cycle.periodStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const endDate = cycle.periodEnd.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      console.log(`- ${cycle.name} (${startDate} – ${endDate}) - ${cycle.status}`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedPredefinedCycles();
