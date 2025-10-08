const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Get managers with outlier average scores in a cycle
router.get('/outliers', async (req, res) => {
  try {
    const { cycleId } = req.query;
    
    if (!cycleId) {
      return res.status(400).json({ message: 'Cycle ID is required' });
    }

    // Get all completed appraisals for the cycle
    const appraisals = await prisma.appraisalInstance.findMany({
      where: {
        cycleId,
        status: 'COMPLETED',
        managerRating: {
          not: null
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

    if (appraisals.length < 3) {
      return res.json({
        message: 'Not enough data for outlier analysis',
        totalAppraisals: appraisals.length,
        outliers: []
      });
    }

    // Group by manager and calculate statistics
    const managerStats = {};
    
    appraisals.forEach(appraisal => {
      const managerId = appraisal.reviewerId || 'unknown';
      if (!managerStats[managerId]) {
        managerStats[managerId] = {
          managerId,
          ratings: [],
          count: 0
        };
      }
      managerStats[managerId].ratings.push(appraisal.managerRating);
      managerStats[managerId].count++;
    });

    // Calculate z-scores
    const allRatings = appraisals.map(a => a.managerRating);
    const overallMean = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
    const overallStdDev = Math.sqrt(
      allRatings.reduce((sum, rating) => sum + Math.pow(rating - overallMean, 2), 0) / allRatings.length
    );

    const outliers = Object.values(managerStats)
      .map(manager => {
        const mean = manager.ratings.reduce((sum, rating) => sum + rating, 0) / manager.ratings.length;
        const zScore = (mean - overallMean) / overallStdDev;
        
        return {
          managerId: manager.managerId,
          averageRating: parseFloat(mean.toFixed(2)),
          count: manager.count,
          zScore: parseFloat(zScore.toFixed(2)),
          isOutlier: Math.abs(zScore) > 1.5, // Z-score threshold for outliers
          severity: Math.abs(zScore) > 2 ? 'HIGH' : Math.abs(zScore) > 1.5 ? 'MEDIUM' : 'LOW'
        };
      })
      .filter(manager => manager.isOutlier)
      .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));

    res.json({
      cycleId,
      totalAppraisals: appraisals.length,
      overallMean: parseFloat(overallMean.toFixed(2)),
      overallStdDev: parseFloat(overallStdDev.toFixed(2)),
      outliers: outliers,
      summary: {
        totalManagers: Object.keys(managerStats).length,
        outlierManagers: outliers.length,
        highSeverity: outliers.filter(o => o.severity === 'HIGH').length,
        mediumSeverity: outliers.filter(o => o.severity === 'MEDIUM').length
      }
    });
  } catch (error) {
    console.error('Error analyzing outliers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get rating distribution for a cycle
router.get('/distribution', async (req, res) => {
  try {
    const { cycleId } = req.query;
    
    if (!cycleId) {
      return res.status(400).json({ message: 'Cycle ID is required' });
    }

    const distribution = await prisma.appraisalInstance.groupBy({
      by: ['managerRating'],
      where: {
        cycleId,
        status: 'COMPLETED',
        managerRating: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        managerRating: 'asc'
      }
    });

    res.json({
      cycleId,
      distribution: distribution.map(d => ({
        rating: d.managerRating,
        count: d._count.id
      })),
      total: distribution.reduce((sum, d) => sum + d._count.id, 0)
    });
  } catch (error) {
    console.error('Error fetching distribution:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
