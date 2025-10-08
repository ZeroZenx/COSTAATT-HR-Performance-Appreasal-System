const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function importCSVStaff() {
  try {
    console.log('🚀 Starting CSV staff import...');
    
    const staffData = [];
    
    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream('scripts/staff-data.csv')
        .pipe(csv())
        .on('data', (row) => {
          staffData.push({
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            role: row.role,
            title: row.title,
            department: row.department,
            division: row.division,
            employmentType: row.employmentType,
            employmentCategory: row.employmentCategory,
            contractStartDate: row.contractStartDate,
            contractEndDate: row.contractEndDate,
            expectedAppraisalMonth: row.expectedAppraisalMonth,
            expectedAppraisalDay: parseInt(row.expectedAppraisalDay) || null,
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Processing ${staffData.length} employees from CSV...`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const staff of staffData) {
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

    console.log('🎉 CSV staff import finished!');
    console.log(`📊 Total employees imported: ${importedCount}`);
    console.log(`⏭️ Skipped existing: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total in system: ${importedCount + skippedCount}`);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importCSVStaff();
