const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDeleteAppraisal() {
  const appraisalId = process.argv[2];
  
  if (!appraisalId) {
    console.log('Usage: node debug-delete-appraisal.js <appraisal-id>');
    process.exit(1);
  }
  
  console.log('Testing delete operation for appraisal ID:', appraisalId);
  
  try {
    // First, check if the appraisal exists
    const appraisal = await prisma.appraisalInstance.findUnique({
      where: { id: appraisalId },
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
        }
      }
    });
    
    if (!appraisal) {
      console.log('❌ Appraisal not found');
      return;
    }
    
    console.log('✅ Appraisal found:', {
      id: appraisal.id,
      status: appraisal.status,
      employeeName: appraisal.employee?.user ? 
        `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}` : 
        'Unknown'
    });
    
    // Check related data
    const sectionInstances = await prisma.appraisalSectionInstance.count({
      where: { instanceId: appraisalId }
    });
    console.log('📊 Section instances:', sectionInstances);
    
    const responses = await prisma.appraisalResponse.count({
      where: { instanceId: appraisalId }
    });
    console.log('📋 Responses:', responses);
    
    const goals = await prisma.goal.count({
      where: { instanceId: appraisalId }
    });
    console.log('🎯 Goals:', goals);
    
    // Check if AppraisalCompetency table exists
    try {
      const competencies = await prisma.appraisalCompetency.count({
        where: { appraisalId: appraisalId }
      });
      console.log('💪 Competencies:', competencies);
    } catch (error) {
      console.log('⚠️ Competency table check failed:', error.message);
    }
    
    console.log('\n🔍 All related data counts retrieved successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteAppraisal();
