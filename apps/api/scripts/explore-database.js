#!/usr/bin/env node

/**
 * 🔍 COSTAATT Database Explorer
 * 
 * This script explores your existing COSTAATT database structure
 * to understand what tables and columns are available for integration.
 */

const { Pool } = require('pg');

async function exploreDatabase() {
  console.log('🔍 Exploring COSTAATT database structure...\n');

  const pool = new Pool({
    host: process.env.COSTAATT_DB_HOST || 'localhost',
    port: process.env.COSTAATT_DB_PORT || 5432,
    database: process.env.COSTAATT_DB_NAME || 'costaatt_hr',
    user: process.env.COSTAATT_DB_USER || 'postgres',
    password: process.env.COSTAATT_DB_PASSWORD || 'postgres',
    ssl: process.env.COSTAATT_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    // 1. List all tables
    console.log('📋 Available Tables:');
    const tablesResult = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(`  • ${row.table_name} (${row.table_type})`);
    });

    // 2. Check for employee-related tables
    console.log('\n👥 Employee-related tables:');
    const employeeTables = tablesResult.rows.filter(row => 
      row.table_name.toLowerCase().includes('employee') || 
      row.table_name.toLowerCase().includes('staff') ||
      row.table_name.toLowerCase().includes('user') ||
      row.table_name.toLowerCase().includes('person')
    );
    
    if (employeeTables.length > 0) {
      employeeTables.forEach(table => {
        console.log(`  • ${table.table_name}`);
      });
    } else {
      console.log('  No obvious employee tables found');
    }

    // 3. Check for department-related tables
    console.log('\n🏢 Department-related tables:');
    const deptTables = tablesResult.rows.filter(row => 
      row.table_name.toLowerCase().includes('department') || 
      row.table_name.toLowerCase().includes('division') ||
      row.table_name.toLowerCase().includes('org')
    );
    
    if (deptTables.length > 0) {
      deptTables.forEach(table => {
        console.log(`  • ${table.table_name}`);
      });
    } else {
      console.log('  No obvious department tables found');
    }

    // 4. Get sample data from first few tables
    console.log('\n📊 Sample data from available tables:');
    for (let i = 0; i < Math.min(3, tablesResult.rows.length); i++) {
      const tableName = tablesResult.rows[i].table_name;
      try {
        const sampleResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 3`);
        console.log(`\n  Table: ${tableName}`);
        console.log(`  Columns: ${Object.keys(sampleResult.rows[0] || {}).join(', ')}`);
        if (sampleResult.rows.length > 0) {
          console.log(`  Sample row:`, sampleResult.rows[0]);
        }
      } catch (error) {
        console.log(`  Table: ${tableName} - Error: ${error.message}`);
      }
    }

    // 5. Check for specific HR-related columns
    console.log('\n🔍 Searching for HR-related columns across all tables:');
    const columnSearch = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (
        column_name ILIKE '%employee%' OR
        column_name ILIKE '%staff%' OR
        column_name ILIKE '%name%' OR
        column_name ILIKE '%email%' OR
        column_name ILIKE '%department%' OR
        column_name ILIKE '%position%' OR
        column_name ILIKE '%title%'
      )
      ORDER BY table_name, column_name
    `);
    
    if (columnSearch.rows.length > 0) {
      columnSearch.rows.forEach(row => {
        console.log(`  • ${row.table_name}.${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('  No obvious HR-related columns found');
    }

  } catch (error) {
    console.error('❌ Error exploring database:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the exploration
if (require.main === module) {
  exploreDatabase()
    .then(() => {
      console.log('\n✅ Database exploration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Exploration failed:', error);
      process.exit(1);
    });
}

module.exports = { exploreDatabase };
