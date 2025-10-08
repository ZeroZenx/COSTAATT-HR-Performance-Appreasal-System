const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Generate additional staff data to reach 349 total
// We currently have 50 employees, so we need to add 299 more

async function generateRemainingStaff() {
  try {
    console.log('🚀 Generating remaining staff to reach 349 total...');
    
    // Get current count
    const currentCount = await prisma.employee.count();
    console.log(`📊 Current employee count: ${currentCount}`);
    
    const targetCount = 349;
    const remainingNeeded = targetCount - currentCount;
    console.log(`📈 Need to add ${remainingNeeded} more employees to reach ${targetCount} total`);
    
    if (remainingNeeded <= 0) {
      console.log('✅ Already have enough employees!');
      return;
    }
    
    // Generate additional staff data
    const additionalStaff = [];
    const departments = [
      "Academic Affairs", "Student Affairs", "Administration", "Finance", "Human Resources",
      "Information Technology", "Facilities", "Security", "Library", "Research",
      "Marketing", "Student Services", "Academic Support", "Quality Assurance", "Planning"
    ];
    
    const divisions = ["Academic Affairs", "Student Affairs", "Administration", "Support Services"];
    const employmentTypes = ["Full-time", "Part-time", "Contract"];
    const employmentCategories = ["FACULTY", "GENERAL_STAFF", "EXECUTIVE", "CLINICAL"];
    const roles = ["EMPLOYEE", "SUPERVISOR"];
    
    const firstNames = [
      "John", "Jane", "Michael", "Sarah", "David", "Lisa", "Robert", "Maria", "James", "Anna",
      "William", "Jennifer", "Richard", "Linda", "Charles", "Patricia", "Thomas", "Barbara",
      "Christopher", "Elizabeth", "Daniel", "Helen", "Matthew", "Sandra", "Anthony", "Donna",
      "Mark", "Carol", "Donald", "Ruth", "Steven", "Sharon", "Paul", "Michelle", "Andrew", "Laura",
      "Joshua", "Sarah", "Kenneth", "Kimberly", "Kevin", "Deborah", "Brian", "Dorothy", "George", "Amy"
    ];
    
    const lastNames = [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
      "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor",
      "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez",
      "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright",
      "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall"
    ];
    
    const titles = [
      "Administrative Assistant", "Clerical Assistant", "Senior Lecturer", "Lecturer", "Professor",
      "Manager", "Director", "Coordinator", "Specialist", "Analyst", "Technician", "Supervisor",
      "Assistant", "Officer", "Counsellor", "Advisor", "Consultant", "Executive", "Vice President"
    ];
    
    for (let i = 1; i <= remainingNeeded; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@costaatt.edu.tt`;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const division = divisions[Math.floor(Math.random() * divisions.length)];
      const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
      const employmentCategory = employmentCategories[Math.floor(Math.random() * employmentCategories.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      
      // Generate random contract dates
      const startYear = 2020 + Math.floor(Math.random() * 4);
      const startMonth = Math.floor(Math.random() * 12) + 1;
      const startDay = Math.floor(Math.random() * 28) + 1;
      const contractStartDate = `${startYear}-${startMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`;
      
      const endYear = startYear + 1 + Math.floor(Math.random() * 3);
      const endMonth = Math.floor(Math.random() * 12) + 1;
      const endDay = Math.floor(Math.random() * 28) + 1;
      const contractEndDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}`;
      
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const expectedAppraisalMonth = months[Math.floor(Math.random() * months.length)];
      const expectedAppraisalDay = Math.floor(Math.random() * 28) + 1;
      
      additionalStaff.push({
        firstName,
        lastName,
        email,
        role,
        title,
        department,
        division,
        employmentType,
        employmentCategory,
        contractStartDate,
        contractEndDate,
        expectedAppraisalMonth,
        expectedAppraisalDay,
      });
    }
    
    console.log(`📊 Generated ${additionalStaff.length} additional staff members...`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Import in batches of 50
    const batchSize = 50;
    const totalBatches = Math.ceil(additionalStaff.length / batchSize);
    
    console.log(`📦 Processing in ${totalBatches} batches of ${batchSize} employees each...`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, additionalStaff.length);
      const batch = additionalStaff.slice(startIndex, endIndex);
      
      console.log(`\n📦 Processing batch ${batchIndex + 1}/${totalBatches} (employees ${startIndex + 1}-${endIndex})...`);
      
      for (const staff of batch) {
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
      
      // Small delay between batches
      if (batchIndex < totalBatches - 1) {
        console.log(`⏳ Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 Remaining staff generation finished!');
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

generateRemainingStaff();
