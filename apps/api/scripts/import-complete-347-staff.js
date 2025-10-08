const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { parse } = require('csv-parse');
const { createReadStream } = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();

async function readCompleteStaffData(filePath) {
  return new Promise((resolve, reject) => {
    const staff = [];
    
    createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        // Extract data from the matched.csv format
        const staffMember = {
          firstName: row.FirstName,
          lastName: row.LastName,
          email: row.DBEmail,
          department: row.ListDepartment,
          division: row.ListDepartment, // Using department as division for now
          title: row.ListJobTitle,
          employmentType: 'Full-time', // Default to full-time
          employmentCategory: determineEmploymentCategory(row.ListJobTitle),
          role: determineRole(row.ListJobTitle),
          contractStartDate: '2020-01-01', // Default start date
          contractEndDate: '2025-12-31', // Default end date
          expectedAppraisalMonth: 'December', // Default appraisal month
          expectedAppraisalDay: 31 // Default appraisal day
        };
        staff.push(staffMember);
      })
      .on('end', () => {
        console.log(`📊 Read ${staff.length} staff members from CSV`);
        resolve(staff);
      })
      .on('error', reject);
  });
}

function determineEmploymentCategory(jobTitle) {
  const title = jobTitle.toLowerCase();
  if (title.includes('lecturer') || title.includes('professor') || title.includes('chair') || title.includes('dean')) {
    return 'FACULTY';
  } else if (title.includes('vice president') || title.includes('president') || title.includes('director') || title.includes('manager')) {
    return 'EXECUTIVE';
  } else if (title.includes('clinical') || title.includes('nurse') || title.includes('medical')) {
    return 'CLINICAL';
  } else {
    return 'GENERAL_STAFF';
  }
}

function determineRole(jobTitle) {
  const title = jobTitle.toLowerCase();
  if (title.includes('vice president') || title.includes('president') || title.includes('director') || title.includes('manager') || title.includes('chair') || title.includes('dean')) {
    return 'SUPERVISOR';
  } else {
    return 'EMPLOYEE';
  }
}

async function importCompleteStaff() {
  try {
    console.log('🚀 Starting comprehensive import of ALL 347 staff members...');
    
        // Clear existing employees first (handle foreign key constraints)
        console.log('🧹 Clearing existing employees...');
        await prisma.appraisalInstance.deleteMany();
        await prisma.employee.deleteMany();
        await prisma.user.deleteMany({ where: { role: { not: 'HR_ADMIN' } } });
    
    // Read the complete staff data
    const staffData = await readCompleteStaffData('data/complete_staff.csv');
    
    console.log(`📊 Processing ${staffData.length} employees from the complete list...`);
    
    // Process in batches
    const batchSize = 50;
    const batches = Math.ceil(staffData.length / batchSize);
    
    console.log(`📦 Processing in ${batches} batches of ${batchSize} employees each...`);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, staffData.length);
      const batch = staffData.slice(start, end);
      
      console.log(`📦 Processing batch ${i + 1}/${batches} (employees ${start + 1}-${end})...`);
      
      for (const staff of batch) {
        try {
          // Create user first
          const user = await prisma.user.create({
            data: {
              email: staff.email,
              passwordHash: '$2b$10$dummy.hash.for.new.employees', // Default password
              role: staff.role,
              firstName: staff.firstName,
              lastName: staff.lastName,
              dept: staff.department,
              title: staff.title,
              active: true
            }
          });
          
          // Create employee record
          const employee = await prisma.employee.create({
            data: {
              userId: user.id,
              dept: staff.department,
              division: staff.division,
              employmentType: staff.employmentType,
              employmentCategory: staff.employmentCategory,
              contractStartDate: new Date(staff.contractStartDate),
              contractEndDate: new Date(staff.contractEndDate),
              expectedAppraisalMonth: staff.expectedAppraisalMonth,
              expectedAppraisalDay: staff.expectedAppraisalDay
            }
          });
          
          console.log(`✅ Added: ${staff.firstName} ${staff.lastName} (${staff.title})`);
        } catch (error) {
          console.error(`❌ Error adding ${staff.firstName} ${staff.lastName}:`, error.message);
        }
      }
    }
    
    // Get final count
    const finalCount = await prisma.employee.count();
    console.log(`\n🎉 Complete 347 staff import finished!`);
    console.log(`📊 Total employees imported: ${finalCount}`);
    console.log(`📈 Progress towards 347: ${finalCount}/347 (${Math.round((finalCount/347)*100)}%)`);
    
    // Show breakdown by department
    const deptBreakdown = await prisma.employee.groupBy({
      by: ['division'],
      _count: { id: true }
    });
    
    console.log('\n📊 Employees by Division:');
    deptBreakdown.forEach(dept => {
      console.log(`  ${dept.division}: ${dept._count.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCompleteStaff();
