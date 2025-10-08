const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');

class PostgreSQLIntegration {
  constructor() {
    // Your existing COSTAATT PostgreSQL database
    this.costaattDb = new Pool({
      host: process.env.COSTAATT_DB_HOST || 'your-costaatt-server.costaatt.edu.tt',
      port: process.env.COSTAATT_DB_PORT || 5432,
      database: process.env.COSTAATT_DB_NAME || 'costaatt_hr',
      user: process.env.COSTAATT_DB_USER || 'hr_readonly',
      password: process.env.COSTAATT_DB_PASSWORD,
      ssl: process.env.COSTAATT_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Your performance system database
    this.prisma = new PrismaClient();
  }

  // 🔄 SYNC EMPLOYEE DATA FROM COSTAATT DATABASE
  async syncEmployees() {
    try {
      console.log('🔄 Syncing employees from COSTAATT database...');
      
      // Query your existing COSTAATT employee data
      const costaattEmployees = await this.costaattDb.query(`
        SELECT 
          employee_id,
          first_name,
          last_name,
          email,
          department,
          position_title,
          employment_type,
          hire_date,
          supervisor_id,
          status,
          phone_number,
          office_location
        FROM employees 
        WHERE status = 'ACTIVE'
        ORDER BY department, last_name
      `);

      console.log(`📊 Found ${costaattEmployees.rows.length} active employees in COSTAATT database`);

      // Sync with performance system
      for (const emp of costaattEmployees.rows) {
        await this.syncEmployee(emp);
      }

      console.log('✅ Employee sync completed successfully');
      return { success: true, count: costaattEmployees.rows.length };
    } catch (error) {
      console.error('❌ Error syncing employees:', error);
      throw error;
    }
  }

  // 🔄 SYNC DEPARTMENT DATA
  async syncDepartments() {
    try {
      console.log('🔄 Syncing departments from COSTAATT database...');
      
      const departments = await this.costaattDb.query(`
        SELECT DISTINCT 
          department,
          department_head,
          department_code,
          location,
          budget_code
        FROM employees 
        WHERE department IS NOT NULL
        ORDER BY department
      `);

      console.log(`📊 Found ${departments.rows.length} departments`);
      return departments.rows;
    } catch (error) {
      console.error('❌ Error syncing departments:', error);
      throw error;
    }
  }

  // 🔄 SYNC ORGANIZATIONAL STRUCTURE
  async syncOrganizationalStructure() {
    try {
      console.log('🔄 Syncing organizational structure...');
      
      const orgStructure = await this.costaattDb.query(`
        SELECT 
          e.employee_id,
          e.first_name,
          e.last_name,
          e.department,
          e.position_title,
          s.employee_id as supervisor_id,
          s.first_name as supervisor_first_name,
          s.last_name as supervisor_last_name,
          s.position_title as supervisor_title
        FROM employees e
        LEFT JOIN employees s ON e.supervisor_id = s.employee_id
        WHERE e.status = 'ACTIVE'
        ORDER BY e.department, e.last_name
      `);

      console.log(`📊 Synced organizational structure for ${orgStructure.rows.length} employees`);
      return orgStructure.rows;
    } catch (error) {
      console.error('❌ Error syncing organizational structure:', error);
      throw error;
    }
  }

  // 🔄 SYNC EMPLOYEE PERFORMANCE HISTORY
  async syncPerformanceHistory() {
    try {
      console.log('🔄 Syncing performance history...');
      
      const performanceData = await this.costaattDb.query(`
        SELECT 
          employee_id,
          appraisal_year,
          overall_rating,
          goals_achieved,
          development_areas,
          supervisor_comments,
          employee_comments,
          appraisal_date
        FROM performance_reviews 
        WHERE appraisal_date >= CURRENT_DATE - INTERVAL '3 years'
        ORDER BY employee_id, appraisal_date DESC
      `);

      console.log(`📊 Found ${performanceData.rows.length} performance records`);
      return performanceData.rows;
    } catch (error) {
      console.error('❌ Error syncing performance history:', error);
      throw error;
    }
  }

  // 🔄 SYNC TRAINING AND DEVELOPMENT DATA
  async syncTrainingData() {
    try {
      console.log('🔄 Syncing training and development data...');
      
      const trainingData = await this.costaattDb.query(`
        SELECT 
          e.employee_id,
          e.first_name,
          e.last_name,
          t.training_name,
          t.completion_date,
          t.certification_status,
          t.provider,
          t.cost,
          t.rating
        FROM employees e
        LEFT JOIN training_records t ON e.employee_id = t.employee_id
        WHERE t.completion_date >= CURRENT_DATE - INTERVAL '2 years'
        ORDER BY e.employee_id, t.completion_date DESC
      `);

      console.log(`📊 Found ${trainingData.rows.length} training records`);
      return trainingData.rows;
    } catch (error) {
      console.error('❌ Error syncing training data:', error);
      throw error;
    }
  }

  // 🔄 SYNC INDIVIDUAL EMPLOYEE
  async syncEmployee(costaattEmployee) {
    try {
      // Check if employee exists in performance system
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          user: {
            email: costaattEmployee.email
          }
        },
        include: { user: true }
      });

      if (existingEmployee) {
        // Update existing employee
        await this.prisma.employee.update({
          where: { id: existingEmployee.id },
          data: {
            dept: costaattEmployee.department,
            division: costaattEmployee.department,
            employmentType: costaattEmployee.employment_type,
            contractStartDate: costaattEmployee.hire_date ? new Date(costaattEmployee.hire_date) : null,
          }
        });

        await this.prisma.user.update({
          where: { id: existingEmployee.userId },
          data: {
            firstName: costaattEmployee.first_name,
            lastName: costaattEmployee.last_name,
            email: costaattEmployee.email,
            dept: costaattEmployee.department,
            title: costaattEmployee.position_title,
          }
        });

        console.log(`✅ Updated employee: ${costaattEmployee.first_name} ${costaattEmployee.last_name}`);
      } else {
        // Create new employee
        const user = await this.prisma.user.create({
          data: {
            email: costaattEmployee.email,
            firstName: costaattEmployee.first_name,
            lastName: costaattEmployee.last_name,
            role: 'EMPLOYEE',
            dept: costaattEmployee.department,
            title: costaattEmployee.position_title,
            active: true
          }
        });

        await this.prisma.employee.create({
          data: {
            userId: user.id,
            dept: costaattEmployee.department,
            division: costaattEmployee.department,
            employmentType: costaattEmployee.employment_type,
            contractStartDate: costaattEmployee.hire_date ? new Date(costaattEmployee.hire_date) : null,
          }
        });

        console.log(`✅ Created new employee: ${costaattEmployee.first_name} ${costaattEmployee.last_name}`);
      }
    } catch (error) {
      console.error(`❌ Error syncing employee ${costaattEmployee.email}:`, error);
    }
  }

  // 📊 GET REAL-TIME ANALYTICS
  async getRealTimeAnalytics() {
    try {
      const analytics = await this.costaattDb.query(`
        SELECT 
          department,
          COUNT(*) as total_employees,
          AVG(CASE WHEN appraisal_rating IS NOT NULL THEN appraisal_rating END) as avg_rating,
          COUNT(CASE WHEN training_completed = true THEN 1 END) as trained_employees,
          COUNT(CASE WHEN appraisal_due = true THEN 1 END) as appraisals_due
        FROM employees e
        LEFT JOIN performance_summary p ON e.employee_id = p.employee_id
        WHERE e.status = 'ACTIVE'
        GROUP BY department
        ORDER BY total_employees DESC
      `);

      return analytics.rows;
    } catch (error) {
      console.error('❌ Error getting analytics:', error);
      throw error;
    }
  }

  // 🔄 FULL SYSTEM SYNC
  async fullSync() {
    try {
      console.log('🚀 Starting full system sync with COSTAATT database...');
      
      const results = {
        employees: await this.syncEmployees(),
        departments: await this.syncDepartments(),
        orgStructure: await this.syncOrganizationalStructure(),
        performance: await this.syncPerformanceHistory(),
        training: await this.syncTrainingData(),
        analytics: await this.getRealTimeAnalytics()
      };

      console.log('✅ Full system sync completed successfully');
      return results;
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      throw error;
    }
  }

  // 🔌 TEST CONNECTION
  async testConnection() {
    try {
      const result = await this.costaattDb.query('SELECT NOW() as current_time, version() as postgres_version');
      console.log('✅ COSTAATT database connection successful');
      console.log(`📅 Server time: ${result.rows[0].current_time}`);
      console.log(`🐘 PostgreSQL version: ${result.rows[0].postgres_version}`);
      return true;
    } catch (error) {
      console.error('❌ COSTAATT database connection failed:', error);
      return false;
    }
  }

  // 🔒 CLOSE CONNECTIONS
  async close() {
    await this.costaattDb.end();
    await this.prisma.$disconnect();
  }
}

module.exports = PostgreSQLIntegration;
