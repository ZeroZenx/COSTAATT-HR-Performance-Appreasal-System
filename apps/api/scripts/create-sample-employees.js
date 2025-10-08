const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleEmployees() {
  try {
    console.log('👥 Creating sample employees...');

    const employees = [
      {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@costaatt.edu.tt',
        division: 'Academic Affairs',
        employmentType: 'FULL_TIME',
        position: 'Professor',
        hireDate: new Date('2020-01-15'),
        dept: 'Academic Affairs',
        active: true
      },
      {
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@costaatt.edu.tt',
        division: 'Administration',
        employmentType: 'FULL_TIME',
        position: 'Administrative Officer',
        hireDate: new Date('2019-03-01'),
        dept: 'Administration',
        active: true
      },
      {
        employeeId: 'EMP003',
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@costaatt.edu.tt',
        division: 'Student Services',
        employmentType: 'FULL_TIME',
        position: 'Student Advisor',
        hireDate: new Date('2021-06-01'),
        dept: 'Student Services',
        active: true
      },
      {
        employeeId: 'EMP004',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@costaatt.edu.tt',
        division: 'IT Services',
        employmentType: 'FULL_TIME',
        position: 'IT Support Specialist',
        hireDate: new Date('2022-02-15'),
        dept: 'IT Services',
        active: true
      },
      {
        employeeId: 'EMP005',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@costaatt.edu.tt',
        division: 'Human Resources',
        employmentType: 'FULL_TIME',
        position: 'HR Manager',
        hireDate: new Date('2018-09-01'),
        dept: 'Human Resources',
        active: true
      }
    ];

    let createdCount = 0;

    for (const emp of employees) {
      try {
        // Create user first
        const user = await prisma.user.create({
          data: {
            email: emp.email,
            firstName: emp.firstName,
            lastName: emp.lastName,
            role: 'EMPLOYEE',
            authProvider: 'SSO',
            dept: emp.division,
            title: emp.position,
            active: true
          }
        });

        // Create employee with user reference
        const employee = await prisma.employee.create({
          data: {
            userId: user.id,
            dept: emp.dept,
            division: emp.division,
            employmentType: emp.employmentType
          }
        });

        createdCount++;
        console.log(`✅ Created employee: ${user.firstName} ${user.lastName}`);
      } catch (error) {
        console.log(`⚠️  Skipped employee ${emp.employeeId}: ${error.message}`);
      }
    }

    console.log(`✅ Created ${createdCount} sample employees`);

  } catch (error) {
    console.error('❌ Error creating sample employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleEmployees();
