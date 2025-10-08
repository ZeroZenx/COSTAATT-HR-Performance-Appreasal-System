#!/usr/bin/env node

/**
 * 🔌 COSTAATT PostgreSQL Integration Setup Script
 * 
 * This script sets up the integration between your COSTAATT HR system
 * and the Performance Gateway using PostgreSQL.
 */

const { PrismaClient } = require('@prisma/client');
const PostgreSQLIntegration = require('../src/integrations/postgresql-integration');

async function setupPostgreSQLIntegration() {
  console.log('🚀 Setting up COSTAATT PostgreSQL Integration...\n');

  const prisma = new PrismaClient();
  const integration = new PostgreSQLIntegration();

  try {
    // 1. Test COSTAATT database connection
    console.log('1️⃣ Testing COSTAATT database connection...');
    const isConnected = await integration.testConnection();
    
    if (!isConnected) {
      console.log('❌ Cannot connect to COSTAATT database. Please check your configuration.');
      console.log('📝 Make sure to set the following environment variables:');
      console.log('   - COSTAATT_DB_HOST');
      console.log('   - COSTAATT_DB_PORT');
      console.log('   - COSTAATT_DB_NAME');
      console.log('   - COSTAATT_DB_USER');
      console.log('   - COSTAATT_DB_PASSWORD');
      return;
    }

    // 2. Get current employee count from COSTAATT
    console.log('\n2️⃣ Getting employee count from COSTAATT database...');
    const costaattCount = await integration.costaattDb.query('SELECT COUNT(*) as count FROM employees WHERE status = \'ACTIVE\'');
    console.log(`📊 COSTAATT has ${costaattCount.rows[0].count} active employees`);

    // 3. Get current employee count from Performance System
    console.log('\n3️⃣ Getting employee count from Performance System...');
    const performanceCount = await prisma.employee.count();
    console.log(`📊 Performance System has ${performanceCount} employees`);

    // 4. Show sync options
    console.log('\n4️⃣ Integration Options:');
    console.log('   🔄 Full Sync: Sync all data from COSTAATT to Performance System');
    console.log('   👥 Employee Sync: Sync only employee data');
    console.log('   🏢 Department Sync: Sync only department data');
    console.log('   📊 Analytics: Get real-time analytics from COSTAATT');

    // 5. Perform full sync (if requested)
    if (process.argv.includes('--full-sync')) {
      console.log('\n🔄 Performing full system sync...');
      const results = await integration.fullSync();
      console.log('✅ Full sync completed successfully');
      console.log(`📊 Results:`, results);
    }

    // 6. Show integration status
    console.log('\n📊 Integration Status:');
    console.log(`   COSTAATT Employees: ${costaattCount.rows[0].count}`);
    console.log(`   Performance Employees: ${performanceCount}`);
    console.log(`   Sync Status: ${performanceCount === parseInt(costaattCount.rows[0].count) ? '✅ SYNCED' : '⚠️ OUT OF SYNC'}`);

    // 7. Show next steps
    console.log('\n🎯 Next Steps:');
    console.log('   1. Configure your COSTAATT database connection in .env');
    console.log('   2. Run: npm run integration:test');
    console.log('   3. Run: npm run integration:sync');
    console.log('   4. Set up automated sync with: npm run integration:schedule');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
    await integration.close();
  }
}

// Run the setup
if (require.main === module) {
  setupPostgreSQLIntegration()
    .then(() => {
      console.log('\n✅ PostgreSQL Integration setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupPostgreSQLIntegration };
