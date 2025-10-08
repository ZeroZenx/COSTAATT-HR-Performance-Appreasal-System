const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// This script will import the remaining staff members to reach 349 total
// We currently have 50 employees, so we need to add 299 more

async function importRemainingStaff() {
  try {
    console.log('🚀 Starting import of remaining staff to reach 349 total...');
    
    // Get current count
    const currentCount = await prisma.employee.count();
    console.log(`📊 Current employee count: ${currentCount}`);
    
    // Calculate how many more we need
    const targetCount = 349;
    const remainingNeeded = targetCount - currentCount;
    console.log(`📈 Need to add ${remainingNeeded} more employees to reach ${targetCount} total`);
    
    if (remainingNeeded <= 0) {
      console.log('✅ Already have enough employees!');
      return;
    }
    
    // Create additional staff data to reach 349 total
    // This is a template that can be extended with the complete dataset
    const additionalStaffData = [
      // Add more staff members here to reach 349 total
      // Each entry should follow this structure:
      { firstName: "Sample", lastName: "Employee1", email: "sample1@costaatt.edu.tt", role: "EMPLOYEE", title: "Sample Position", department: "Sample Department", division: "Sample Division", employmentType: "Full-time", employmentCategory: "GENERAL_STAFF", contractStartDate: "2023-01-01", contractEndDate: "2025-12-31", expectedAppraisalMonth: "December", expectedAppraisalDay: 31 },
      { firstName: "Sample", lastName: "Employee2", email: "sample2@costaatt.edu.tt", role: "EMPLOYEE", title: "Sample Position", department: "Sample Department", division: "Sample Division", employmentType: "Full-time", employmentCategory: "GENERAL_STAFF", contractStartDate: "2023-01-01", contractEndDate: "2025-12-31", expectedAppraisalMonth: "December", expectedAppraisalDay: 31 },
      // ... continue with more entries to reach 349 total
    ];
    
    console.log(`📊 Processing ${additionalStaffData.length} additional employees...`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const staff of additionalStaffData) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: staff.email }
        });

        if (existingUser) {
          console.log(`⏭️ Skipping existing user: ${staff.firstName} ${staff.lastName}`);
          skippedCount++;
          continue;
        }

        const hashedPassword = await bcrypt.hash("P@ssw0rd!", 10);

        const user = await prisma.user.create({
          data: {
            email: staff.email,
            passwordHash: hashedPassword,
            firstName: staff.firstName,
            lastName: staff.lastName,
            role: staff.role,
            dept: staff.department,
            title: staff.title,
            active: true,
            employee: {
              create: {
                dept: staff.department,
                division: staff.division,
                employmentType: staff.employmentType,
                employmentCategory: staff.employmentCategory,
                contractStartDate: new Date(staff.contractStartDate),
                contractEndDate: new Date(staff.contractEndDate),
                expectedAppraisalMonth: staff.expectedAppraisalMonth,
                expectedAppraisalDay: staff.expectedAppraisalDay,
              }
            }
          }
        });
        
        console.log(`✅ Added: ${staff.firstName} ${staff.lastName} (${staff.title})`);
        importedCount++;
      } catch (error) {
        console.error(`❌ Error importing ${staff.firstName} ${staff.lastName}:`, error.message);
        errorCount++;
      }
    }

    console.log('🎉 Remaining staff import finished!');
    console.log(`📊 Total employees imported: ${importedCount}`);
    console.log(`⏭️ Skipped existing: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Get final count
    const finalCount = await prisma.employee.count();
    console.log(`📊 Final employee count in database: ${finalCount}`);
    console.log(`📈 Progress towards 349: ${finalCount}/349 (${Math.round((finalCount/349)*100)}%)`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importRemainingStaff();
