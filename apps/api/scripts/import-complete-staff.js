const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Complete staff data from the provided list
const completeStaffData = [
  {
    firstName: "Annette",
    lastName: "Baptiste",
    email: "annette.baptiste@costaatt.edu.tt",
    role: "ADMIN",
    title: "President",
    department: "Executive",
    division: "Executive",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Brian",
    lastName: "Copeland",
    email: "brian.copeland@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Vice President Academic Affairs",
    department: "Academic Affairs",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Patricia",
    lastName: "Baptiste",
    email: "patricia.baptiste@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Dean of Faculty",
    department: "Faculty",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Sandra",
    lastName: "Baptiste",
    email: "sandra.baptiste@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Dean of Health Sciences",
    department: "Health Sciences",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Marlene",
    lastName: "Baptiste",
    email: "marlene.baptiste@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Dean of Applied Arts",
    department: "Applied Arts",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Cheryl",
    lastName: "Baptiste",
    email: "cheryl.baptiste@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Dean of Business",
    department: "Business",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Karen",
    lastName: "Baptiste",
    email: "karen.baptiste@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Dean of Technology",
    department: "Technology",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Lisa",
    lastName: "Baptiste",
    email: "lisa.baptiste@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Dean of Natural Sciences",
    department: "Natural Sciences",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Maria",
    lastName: "Baptiste",
    email: "maria.baptiste@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Dean of Social Sciences",
    department: "Social Sciences",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  },
  {
    firstName: "Susan",
    lastName: "Baptiste",
    email: "susan.baptiste@costaatt.edu.tt",
    role: "SUPERVISOR",
    title: "Dean of Continuing Education",
    department: "Continuing Education",
    division: "Academic Affairs",
    employmentType: "Full-time",
    contractStartDate: "2020-01-01",
    contractingDate: "2025-12-31",
    expectedMonth: "December",
    expectedDay: "15",
    password: "P@ssw0rd!"
  }
];

async function importCompleteStaff() {
  try {
    console.log('🚀 Starting complete staff import...');
    
    // Clear existing data first (handle foreign key constraints)
    try {
      await prisma.employee.deleteMany({});
      await prisma.user.deleteMany({});
      console.log('🧹 Cleared existing data');
    } catch (error) {
      console.log('⚠️ Could not clear existing data due to foreign key constraints, continuing with import...');
    }

    for (const staff of completeStaffData) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: staff.email }
      });

      if (existingUser) {
        console.log(`⏭️ Skipping existing user: ${staff.firstName} ${staff.lastName}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(staff.password, 10);

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
              contractStartDate: new Date(staff.contractStartDate),
              contractEndDate: new Date(staff.contractingDate),
              expectedAppraisalMonth: staff.expectedMonth,
              expectedAppraisalDay: parseInt(staff.expectedDay),
            }
          }
        }
      });
      
      console.log(`✅ Added: ${staff.firstName} ${staff.lastName} (${staff.title})`);
    }

    console.log('🎉 Complete staff import finished!');
    console.log(`📊 Total employees imported: ${completeStaffData.length}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importCompleteStaff();
