const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSelfEvaluationStatus() {
  try {
    console.log('🔧 Starting self-evaluation status fix...\n');
    
    // Find all appraisal instances that have selfAppraisalData but wrong status
    const selfEvaluations = await prisma.appraisalInstance.findMany({
      where: {
        selfAppraisalData: {
          not: null
        },
        status: {
          notIn: ['SELF_EVALUATION']
        }
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        cycle: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`📊 Found ${selfEvaluations.length} self-evaluations with incorrect status\n`);

    if (selfEvaluations.length === 0) {
      console.log('✅ No self-evaluations need fixing!');
      return;
    }

    console.log('🔄 Updating self-evaluation statuses...\n');

    for (const selfEval of selfEvaluations) {
      const employeeName = `${selfEval.employee.user.firstName} ${selfEval.employee.user.lastName}`;
      const cycleName = selfEval.cycle.name;
      
      console.log(`   • ${employeeName} - ${cycleName}`);
      console.log(`     Current status: ${selfEval.status}`);
      
      await prisma.appraisalInstance.update({
        where: { id: selfEval.id },
        data: {
          status: 'SELF_EVALUATION'
        }
      });
      
      console.log(`     ✅ Updated to: SELF_EVALUATION\n`);
    }

    console.log(`\n🎉 Successfully updated ${selfEvaluations.length} self-evaluation(s)!`);
    console.log('✅ Self-evaluations will no longer appear in the main appraisals list.');

  } catch (error) {
    console.error('❌ Error fixing self-evaluation status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixSelfEvaluationStatus()
  .then(() => {
    console.log('\n✨ Fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });

