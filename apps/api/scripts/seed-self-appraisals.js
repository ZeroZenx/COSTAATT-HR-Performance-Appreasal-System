const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSelfAppraisals() {
  try {
    console.log('🌱 Seeding self-appraisals...');

    // Get the active cycle
    const activeCycle = await prisma.appraisalCycle.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!activeCycle) {
      console.log('❌ No active cycle found. Please activate a cycle first.');
      return;
    }

    console.log(`📅 Using active cycle: ${activeCycle.name}`);

    // Get all active employees
    const employees = await prisma.user.findMany({
      where: { 
        active: true,
        employee: { isNot: null }
      },
      include: { 
        employee: true,
        manager: true
      }
    });

    console.log(`👥 Found ${employees.length} active employees`);

    let created = 0;
    let skipped = 0;

    for (const employee of employees) {
      // Check if self-appraisal already exists
      const existing = await prisma.selfAppraisal.findUnique({
        where: {
          cycleId_employeeId: {
            cycleId: activeCycle.id,
            employeeId: employee.id
          }
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Calculate due date (14 days before cycle end, or 21 days after cycle start)
      const dueDate = new Date(activeCycle.periodEnd);
      dueDate.setDate(dueDate.getDate() - 14);

      // Default answers structure
      const defaultAnswers = {
        q1_accomplishments: '',
        q2_improvements: '',
        q3_satisfaction: '',
        q4_obstacles: '',
        q5_roleChange: '',
        q6_training: '',
        q7_goals: '',
        q8_suggestions: ''
      };

      // Create self-appraisal
      await prisma.selfAppraisal.create({
        data: {
          cycleId: activeCycle.id,
          employeeId: employee.id,
          supervisorId: employee.managerId,
          dueDate,
          answers: defaultAnswers,
          status: 'NOT_STARTED'
        }
      });

      created++;
      console.log(`✅ Created self-appraisal for ${employee.firstName} ${employee.lastName}`);
    }

    console.log('🎉 Self-appraisal seeding completed!');
    console.log(`📊 Created: ${created}`);
    console.log(`⏭️ Skipped: ${skipped}`);

    // Show summary
    const stats = await prisma.selfAppraisal.groupBy({
      by: ['status'],
      where: { cycleId: activeCycle.id },
      _count: { id: true }
    });

    console.log('\n📋 Self-appraisal status summary:');
    stats.forEach(stat => {
      console.log(`- ${stat.status}: ${stat._count.id}`);
    });

  } catch (error) {
    console.error('❌ Error seeding self-appraisals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSelfAppraisals();
