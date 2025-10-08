const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../notifications/emailService');

const prisma = new PrismaClient();

// Run daily at 8:00 AM America/Port_of_Spain time
cron.schedule('0 8 * * *', async () => {
  
  try {
    await checkStuckAppraisals();
    await checkOverdueAppraisals();
  } catch (error) {
    console.error('❌ Daily reminder check failed:', error);
  }
}, {
  timezone: 'America/Port_of_Spain'
});

async function checkStuckAppraisals() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stuckAppraisals = await prisma.appraisalInstance.findMany({
    where: {
      updatedAt: {
        lt: sevenDaysAgo
      },
      status: {
        in: ['DRAFT', 'IN_REVIEW', 'REVIEWED_MANAGER', 'FINAL_REVIEW']
      }
    },
    include: {
      employee: {
        include: {
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      }
    }
  });


  for (const appraisal of stuckAppraisals) {
    const daysStuck = Math.floor((new Date() - appraisal.updatedAt) / (1000 * 60 * 60 * 24));
    
    // Only send reminders every 3 days to avoid spam
    if (daysStuck % 3 === 0) {
      const employeeName = `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}`;
      const managerName = 'Manager'; // You might want to fetch actual manager name
      
      try {
        await emailService.reminder({
          employeeName,
          managerName,
          appraisalId: appraisal.id,
          daysOverdue: daysStuck
        });
        
      } catch (error) {
        console.error(`❌ Failed to send reminder for appraisal ${appraisal.id}:`, error);
      }
    }
  }
}

async function checkOverdueAppraisals() {
  // Check for appraisals that are overdue based on cycle end dates
  const today = new Date();
  
  const overdueAppraisals = await prisma.appraisalInstance.findMany({
    where: {
      status: {
        in: ['DRAFT', 'IN_REVIEW', 'REVIEWED_MANAGER', 'FINAL_REVIEW']
      },
      cycle: {
        periodEnd: {
          lt: today
        }
      }
    },
    include: {
      employee: {
        include: {
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      },
      cycle: true
    }
  });


  for (const appraisal of overdueAppraisals) {
    const employeeName = `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}`;
    const managerName = 'Manager'; // You might want to fetch actual manager name
    const daysOverdue = Math.floor((today - appraisal.cycle.periodEnd) / (1000 * 60 * 60 * 24));
    
    try {
      await emailService.reminder({
        employeeName,
        managerName,
        appraisalId: appraisal.id,
        daysOverdue
      });
      
    } catch (error) {
      console.error(`❌ Failed to send overdue reminder for appraisal ${appraisal.id}:`, error);
    }
  }
}


module.exports = {
  checkStuckAppraisals,
  checkOverdueAppraisals
};
