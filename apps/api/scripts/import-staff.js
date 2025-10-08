const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const staffData = [
  { firstName: "Dr. Annette", lastName: "Baptiste", email: "annette.baptiste@costaatt.edu.tt", title: "President", dept: "Executive" },
  { firstName: "Dr. Brian", lastName: "Copeland", email: "brian.copeland@costaatt.edu.tt", title: "Vice President Academic Affairs", dept: "Academic Affairs" },
  { firstName: "Dr. Patricia", lastName: "Baptiste", email: "patricia.baptiste@costaatt.edu.tt", title: "Dean of Faculty", dept: "Faculty" },
  { firstName: "Dr. Sandra", lastName: "Baptiste", email: "sandra.baptiste@costaatt.edu.tt", title: "Dean of Health Sciences", dept: "Health Sciences" },
  { firstName: "Dr. Marlene", lastName: "Baptiste", email: "marlene.baptiste@costaatt.edu.tt", title: "Dean of Applied Arts", dept: "Applied Arts" },
  { firstName: "Dr. Cheryl", lastName: "Baptiste", email: "cheryl.baptiste@costaatt.edu.tt", title: "Dean of Business", dept: "Business" },
  { firstName: "Dr. Karen", lastName: "Baptiste", email: "karen.baptiste@costaatt.edu.tt", title: "Dean of Engineering", dept: "Engineering" },
  { firstName: "Dr. Lisa", lastName: "Baptiste", email: "lisa.baptiste@costaatt.edu.tt", title: "Dean of Science", dept: "Science" },
  { firstName: "Dr. Maria", lastName: "Baptiste", email: "maria.baptiste@costaatt.edu.tt", title: "Dean of Technology", dept: "Technology" },
  { firstName: "Dr. Susan", lastName: "Baptiste", email: "susan.baptiste@costaatt.edu.tt", title: "Dean of Continuing Education", dept: "Continuing Education" }
];

async function importStaff() {
  try {
    console.log('🚀 Starting staff import...');
    
    for (const staff of staffData) {
      const user = await prisma.user.create({
        data: {
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          passwordHash: '$2b$10$dummy.hash.for.testing',
          role: 'SUPERVISOR',
          dept: staff.dept,
          title: staff.title,
          active: true
        }
      });

      await prisma.employee.create({
        data: {
          userId: user.id,
          dept: staff.dept,
          division: 'Academic Affairs',
          employmentType: 'Full-time',
          supervisorId: null
        }
      });

      console.log(`✅ Added: ${staff.firstName} ${staff.lastName}`);
    }

    console.log('🎉 Staff import completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importStaff();