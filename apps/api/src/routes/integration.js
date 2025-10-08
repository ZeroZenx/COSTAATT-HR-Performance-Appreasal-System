const express = require('express');
const router = express.Router();
const PostgreSQLIntegration = require('../integrations/postgresql-integration');

// 🔌 POSTGRESQL INTEGRATION ROUTES

// Test COSTAATT database connection
router.get('/test-connection', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    const isConnected = await integration.testConnection();
    await integration.close();
    
    if (isConnected) {
      res.json({ 
        success: true, 
        message: 'COSTAATT database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'COSTAATT database connection failed' 
      });
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Connection test failed', 
      error: error.message 
    });
  }
});

// Sync employees from COSTAATT database
router.post('/sync-employees', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    const result = await integration.syncEmployees();
    await integration.close();
    
    res.json({
      success: true,
      message: 'Employee sync completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Employee sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Employee sync failed',
      error: error.message
    });
  }
});

// Sync departments from COSTAATT database
router.post('/sync-departments', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    const departments = await integration.syncDepartments();
    await integration.close();
    
    res.json({
      success: true,
      message: 'Department sync completed successfully',
      data: departments
    });
  } catch (error) {
    console.error('Department sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Department sync failed',
      error: error.message
    });
  }
});

// Sync organizational structure
router.post('/sync-org-structure', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    const orgStructure = await integration.syncOrganizationalStructure();
    await integration.close();
    
    res.json({
      success: true,
      message: 'Organizational structure sync completed successfully',
      data: orgStructure
    });
  } catch (error) {
    console.error('Org structure sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Organizational structure sync failed',
      error: error.message
    });
  }
});

// Sync performance history
router.post('/sync-performance', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    const performance = await integration.syncPerformanceHistory();
    await integration.close();
    
    res.json({
      success: true,
      message: 'Performance history sync completed successfully',
      data: performance
    });
  } catch (error) {
    console.error('Performance sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Performance history sync failed',
      error: error.message
    });
  }
});

// Sync training data
router.post('/sync-training', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    const training = await integration.syncTrainingData();
    await integration.close();
    
    res.json({
      success: true,
      message: 'Training data sync completed successfully',
      data: training
    });
  } catch (error) {
    console.error('Training sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Training data sync failed',
      error: error.message
    });
  }
});

// Full system sync
router.post('/full-sync', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    const results = await integration.fullSync();
    await integration.close();
    
    res.json({
      success: true,
      message: 'Full system sync completed successfully',
      data: results
    });
  } catch (error) {
    console.error('Full sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Full system sync failed',
      error: error.message
    });
  }
});

// Get real-time analytics
router.get('/analytics', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    const analytics = await integration.getRealTimeAnalytics();
    await integration.close();
    
    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Analytics retrieval failed:', error);
    res.status(500).json({
      success: false,
      message: 'Analytics retrieval failed',
      error: error.message
    });
  }
});

// Get sync status
router.get('/sync-status', async (req, res) => {
  try {
    const integration = new PostgreSQLIntegration();
    
    // Get counts from both systems
    const costaattCount = await integration.costaattDb.query('SELECT COUNT(*) as count FROM employees WHERE status = \'ACTIVE\'');
    const performanceCount = await integration.prisma.employee.count();
    
    await integration.close();
    
    res.json({
      success: true,
      data: {
        costaattEmployees: parseInt(costaattCount.rows[0].count),
        performanceEmployees: performanceCount,
        syncStatus: performanceCount === parseInt(costaattCount.rows[0].count) ? 'SYNCED' : 'OUT_OF_SYNC',
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Sync status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Sync status check failed',
      error: error.message
    });
  }
});

module.exports = router;
