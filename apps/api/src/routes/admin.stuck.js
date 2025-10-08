const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Get appraisals stuck in the same status for more than 7 days
router.get('/stuck', async (req, res) => {
  try {
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
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        template: {
          select: { name: true }
        },
        cycle: {
          select: { name: true }
        }
      },
      orderBy: {
        updatedAt: 'asc'
      }
    });

    const result = stuckAppraisals.map(appraisal => {
      const daysStuck = Math.floor((new Date() - appraisal.updatedAt) / (1000 * 60 * 60 * 24));
      
      return {
        id: appraisal.id,
        employeeName: `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}`,
        employeeEmail: appraisal.employee.user.email,
        status: appraisal.status,
        daysStuck,
        lastUpdated: appraisal.updatedAt,
        templateName: appraisal.template.name,
        cycleName: appraisal.cycle.name,
        priority: daysStuck > 14 ? 'HIGH' : daysStuck > 10 ? 'MEDIUM' : 'LOW'
      };
    });

    res.json({
      total: result.length,
      highPriority: result.filter(r => r.priority === 'HIGH').length,
      mediumPriority: result.filter(r => r.priority === 'MEDIUM').length,
      lowPriority: result.filter(r => r.priority === 'LOW').length,
      appraisals: result
    });
  } catch (error) {
    console.error('Error fetching stuck appraisals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get summary statistics
router.get('/stuck/summary', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const summary = await prisma.appraisalInstance.groupBy({
      by: ['status'],
      where: {
        updatedAt: {
          lt: sevenDaysAgo
        },
        status: {
          in: ['DRAFT', 'IN_REVIEW', 'REVIEWED_MANAGER', 'FINAL_REVIEW']
        }
      },
      _count: {
        id: true
      }
    });

    res.json({
      summary: summary.map(s => ({
        status: s.status,
        count: s._count.id
      })),
      totalStuck: summary.reduce((sum, s) => sum + s._count.id, 0)
    });
  } catch (error) {
    console.error('Error fetching stuck summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
