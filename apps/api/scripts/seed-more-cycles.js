const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedMoreCycles() {
  console.log('🌱 Seeding more appraisal cycles...');

  const cycles = [
    {
      name: 'Mid-Year Review 2025',
      periodStart: new Date('2025-06-01'),
      periodEnd: new Date('2025-06-30'),
      status: 'ACTIVE'
    },
    {
      name: 'Q1 Performance Review 2025',
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-03-31'),
      status: 'COMPLETED'
    },
    {
      name: 'Q2 Performance Review 2025',
      periodStart: new Date('2025-04-01'),
      periodEnd: new Date('2025-06-30'),
      status: 'ACTIVE'
    },
    {
      name: 'Q3 Performance Review 2025',
      periodStart: new Date('2025-07-01'),
      periodEnd: new Date('2025-09-30'),
      status: 'PLANNED'
    },
    {
      name: 'Q4 Performance Review 2025',
      periodStart: new Date('2025-10-01'),
      periodEnd: new Date('2025-12-31'),
      status: 'PLANNED'
    },
    {
      name: 'Annual Performance Review 2024',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-12-31'),
      status: 'COMPLETED'
    },
    {
      name: 'Probationary Review Cycle 2025',
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-12-31'),
      status: 'ACTIVE'
    },
    {
      name: 'Executive Review 2025',
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-12-31'),
      status: 'ACTIVE'
    }
  ];

  for (const cycle of cycles) {
    try {
      await prisma.appraisalCycle.create({
        data: cycle
      });
      console.log(`✅ Created cycle: ${cycle.name}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Cycle already exists: ${cycle.name}`);
      } else {
        console.error(`❌ Error creating cycle ${cycle.name}:`, error);
      }
    }
  }

  console.log('🎉 Cycle seeding completed!');
}

seedMoreCycles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
