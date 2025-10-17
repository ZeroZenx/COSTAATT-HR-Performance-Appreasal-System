const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVaruneAppraisal() {
  try {
    // Find Varune's appraisal
    const appraisal = await prisma.appraisalInstance.findFirst({
      where: {
        employee: {
          user: {
            firstName: { contains: 'Varune', mode: 'insensitive' }
          }
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
        sections: true,
        template: true
      }
    });

    if (appraisal) {
      console.log('📊 Varune Appraisal Data:');
      console.log('Employee:', appraisal.employee.user.firstName, appraisal.employee.user.lastName);
      console.log('Template:', appraisal.template.name);
      console.log('Overall Score:', appraisal.overallScore);
      console.log('Status:', appraisal.status);
      console.log('Sections Count:', appraisal.sections.length);
      
      if (appraisal.sections.length > 0) {
        console.log('\n📋 Section Details:');
        appraisal.sections.forEach((section, index) => {
          console.log(`Section ${index + 1}:`);
          console.log('  - Score:', section.score);
          console.log('  - Max Score:', section.maxScore);
          console.log('  - Weight:', section.weight);
          console.log('  - Comments:', section.comments || 'None');
        });
      }

      // Calculate what the score should be
      console.log('\n🧮 Score Calculation:');
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      appraisal.sections.forEach((section) => {
        if (section.maxScore > 0) {
          const sectionPercentage = (section.score / section.maxScore) * 100;
          const weightedScore = sectionPercentage * (section.weight / 100);
          totalWeightedScore += weightedScore;
          totalWeight += section.weight / 100;
          console.log(`Section: ${sectionPercentage.toFixed(1)}% × ${section.weight}% = ${weightedScore.toFixed(1)}`);
        }
      });
      
      const calculatedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      console.log(`\nCalculated Overall Score: ${calculatedScore.toFixed(1)}%`);
      console.log(`Database Overall Score: ${appraisal.overallScore || 0}%`);
      
    } else {
      console.log('❌ No appraisal found for Varune');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVaruneAppraisal();
