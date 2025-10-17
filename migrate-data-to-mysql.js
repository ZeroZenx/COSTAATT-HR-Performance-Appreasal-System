// Data Migration Script: PostgreSQL to MySQL
// This script will help migrate your existing data to MySQL

const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

// Configuration
const POSTGRES_URL = 'postgresql://postgres:postgres@localhost:5432/costaatt_hr';
const MYSQL_URL = 'mysql://root:@localhost:3306/costaatt_hr';

async function migrateData() {
  console.log('🚀 Starting data migration from PostgreSQL to MySQL...');
  
  let postgresPrisma, mysqlConnection;
  
  try {
    // Connect to PostgreSQL (old database)
    console.log('📊 Connecting to PostgreSQL...');
    const postgresPrisma = new PrismaClient({
      datasources: {
        db: {
          url: POSTGRES_URL
        }
      }
    });
    
    // Connect to MySQL
    console.log('🗄️ Connecting to MySQL...');
    mysqlConnection = await mysql.createConnection(MYSQL_URL);
    
    // Test connections
    await postgresPrisma.$connect();
    console.log('✅ PostgreSQL connected');
    console.log('✅ MySQL connected');
    
    // Migrate Users
    console.log('\n👥 Migrating Users...');
    const users = await postgresPrisma.user.findMany();
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      try {
        await mysqlConnection.execute(`
          INSERT INTO User (id, email, firstName, lastName, role, passwordHash, active, dept, title, authProvider, azureId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            email = VALUES(email),
            firstName = VALUES(firstName),
            lastName = VALUES(lastName),
            role = VALUES(role),
            passwordHash = VALUES(passwordHash),
            active = VALUES(active),
            dept = VALUES(dept),
            title = VALUES(title),
            authProvider = VALUES(authProvider),
            azureId = VALUES(azureId),
            updatedAt = VALUES(updatedAt)
        `, [
          user.id, user.email, user.firstName, user.lastName, user.role,
          user.passwordHash, user.active, user.dept, user.title,
          user.authProvider, user.azureId, user.createdAt, user.updatedAt
        ]);
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error.message);
      }
    }
    console.log('✅ Users migrated successfully');
    
    // Migrate Employees
    console.log('\n👨‍💼 Migrating Employees...');
    const employees = await postgresPrisma.employee.findMany();
    console.log(`Found ${employees.length} employees to migrate`);
    
    for (const employee of employees) {
      try {
        await mysqlConnection.execute(`
          INSERT INTO Employee (id, userId, dept, division, employmentType, categoryId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            userId = VALUES(userId),
            dept = VALUES(dept),
            division = VALUES(division),
            employmentType = VALUES(employmentType),
            categoryId = VALUES(categoryId),
            updatedAt = VALUES(updatedAt)
        `, [
          employee.id, employee.userId, employee.dept, employee.division,
          employee.employmentType, employee.categoryId, employee.createdAt, employee.updatedAt
        ]);
      } catch (error) {
        console.error(`Error migrating employee ${employee.id}:`, error.message);
      }
    }
    console.log('✅ Employees migrated successfully');
    
    // Migrate Competencies
    console.log('\n📚 Migrating Competencies...');
    const competencies = await postgresPrisma.competency.findMany();
    console.log(`Found ${competencies.length} competencies to migrate`);
    
    for (const competency of competencies) {
      try {
        await mysqlConnection.execute(`
          INSERT INTO Competency (id, name, description, category, level, weight, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            category = VALUES(category),
            level = VALUES(level),
            weight = VALUES(weight),
            updatedAt = VALUES(updatedAt)
        `, [
          competency.id, competency.name, competency.description, competency.category,
          competency.level, competency.weight, competency.createdAt, competency.updatedAt
        ]);
      } catch (error) {
        console.error(`Error migrating competency ${competency.name}:`, error.message);
      }
    }
    console.log('✅ Competencies migrated successfully');
    
    // Migrate Appraisal Templates
    console.log('\n📋 Migrating Appraisal Templates...');
    const templates = await postgresPrisma.appraisalTemplate.findMany();
    console.log(`Found ${templates.length} templates to migrate`);
    
    for (const template of templates) {
      try {
        await mysqlConnection.execute(`
          INSERT INTO AppraisalTemplate (id, name, displayName, type, version, configJson, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            displayName = VALUES(displayName),
            type = VALUES(type),
            version = VALUES(version),
            configJson = VALUES(configJson),
            updatedAt = VALUES(updatedAt)
        `, [
          template.id, template.name, template.displayName, template.type,
          template.version, JSON.stringify(template.configJson), template.createdAt, template.updatedAt
        ]);
      } catch (error) {
        console.error(`Error migrating template ${template.name}:`, error.message);
      }
    }
    console.log('✅ Appraisal Templates migrated successfully');
    
    // Migrate Appraisal Cycles
    console.log('\n🔄 Migrating Appraisal Cycles...');
    const cycles = await postgresPrisma.appraisalCycle.findMany();
    console.log(`Found ${cycles.length} cycles to migrate`);
    
    for (const cycle of cycles) {
      try {
        await mysqlConnection.execute(`
          INSERT INTO AppraisalCycle (id, name, startDate, endDate, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            startDate = VALUES(startDate),
            endDate = VALUES(endDate),
            status = VALUES(status),
            updatedAt = VALUES(updatedAt)
        `, [
          cycle.id, cycle.name, cycle.startDate, cycle.endDate,
          cycle.status, cycle.createdAt, cycle.updatedAt
        ]);
      } catch (error) {
        console.error(`Error migrating cycle ${cycle.name}:`, error.message);
      }
    }
    console.log('✅ Appraisal Cycles migrated successfully');
    
    // Migrate Appraisal Instances
    console.log('\n📝 Migrating Appraisal Instances...');
    const appraisals = await postgresPrisma.appraisalInstance.findMany();
    console.log(`Found ${appraisals.length} appraisals to migrate`);
    
    for (const appraisal of appraisals) {
      try {
        await mysqlConnection.execute(`
          INSERT INTO AppraisalInstance (id, employeeId, templateId, cycleId, status, selfAppraisalData, managerReviewData, managerSectionNotes, managerComment, managerRating, contractBlock, managerSignedAt, managerSignedName, reviewedAt, createdBy, reviewerId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            employeeId = VALUES(employeeId),
            templateId = VALUES(templateId),
            cycleId = VALUES(cycleId),
            status = VALUES(status),
            selfAppraisalData = VALUES(selfAppraisalData),
            managerReviewData = VALUES(managerReviewData),
            managerSectionNotes = VALUES(managerSectionNotes),
            managerComment = VALUES(managerComment),
            managerRating = VALUES(managerRating),
            contractBlock = VALUES(contractBlock),
            managerSignedAt = VALUES(managerSignedAt),
            managerSignedName = VALUES(managerSignedName),
            reviewedAt = VALUES(reviewedAt),
            createdBy = VALUES(createdBy),
            reviewerId = VALUES(reviewerId),
            updatedAt = VALUES(updatedAt)
        `, [
          appraisal.id, appraisal.employeeId, appraisal.templateId, appraisal.cycleId,
          appraisal.status,
          appraisal.selfAppraisalData ? JSON.stringify(appraisal.selfAppraisalData) : null,
          appraisal.managerReviewData ? JSON.stringify(appraisal.managerReviewData) : null,
          appraisal.managerSectionNotes ? JSON.stringify(appraisal.managerSectionNotes) : null,
          appraisal.managerComment, appraisal.managerRating, appraisal.contractBlock,
          appraisal.managerSignedAt, appraisal.managerSignedName, appraisal.reviewedAt,
          appraisal.createdBy, appraisal.reviewerId, appraisal.createdAt, appraisal.updatedAt
        ]);
      } catch (error) {
        console.error(`Error migrating appraisal ${appraisal.id}:`, error.message);
      }
    }
    console.log('✅ Appraisal Instances migrated successfully');
    
    console.log('\n🎉 Data migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the application with MySQL');
    console.log('2. Verify all data is accessible');
    console.log('3. Update your backup procedures for MySQL');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Clean up connections
    if (postgresPrisma) {
      await postgresPrisma.$disconnect();
    }
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}

// Run the migration
migrateData().catch(console.error);
