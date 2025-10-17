// Seed MySQL database with initial data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  console.log('🌱 Seeding MySQL database with initial data...');

  try {
    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('✅ Database already has data, skipping seed');
      return;
    }

    // Create demo users
    console.log('👥 Creating demo users...');
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@costaatt.edu.tt',
        firstName: 'HR',
        lastName: 'Administrator',
        role: 'HR_ADMIN',
        passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        active: true,
        dept: 'Human Resources',
        title: 'HR Administrator',
        authProvider: 'LOCAL'
      }
    });

    const supervisorUser = await prisma.user.create({
      data: {
        email: 'john.doe@costaatt.edu.tt',
        firstName: 'John',
        lastName: 'Doe',
        role: 'SUPERVISOR',
        passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        active: true,
        dept: 'Technology Services',
        title: 'IT Manager',
        authProvider: 'LOCAL'
      }
    });

    const employeeUser = await prisma.user.create({
      data: {
        email: 'mike.johnson@costaatt.edu.tt',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'EMPLOYEE',
        passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        active: true,
        dept: 'Technology Services',
        title: 'Software Developer',
        authProvider: 'LOCAL'
      }
    });

    console.log('✅ Demo users created');

    // Create employee records
    console.log('👨‍💼 Creating employee records...');

    await prisma.employee.create({
      data: {
        userId: adminUser.id,
        dept: 'Human Resources',
        division: 'Administration',
        employmentType: 'FULL_TIME',
        employmentCategory: 'GENERAL_STAFF'
      }
    });

    await prisma.employee.create({
      data: {
        userId: supervisorUser.id,
        dept: 'Technology Services',
        division: 'IT Department',
        employmentType: 'FULL_TIME',
        employmentCategory: 'SUPERVISORY'
      }
    });

    await prisma.employee.create({
      data: {
        userId: employeeUser.id,
        dept: 'Technology Services',
        division: 'IT Department',
        employmentType: 'FULL_TIME',
        employmentCategory: 'GENERAL_STAFF'
      }
    });

    console.log('✅ Employee records created');

    // Create competencies
    console.log('📚 Creating competencies...');

    const competencies = [
      { name: 'Communication Skills', description: 'Ability to communicate effectively', category: 'Core', level: 'Intermediate', weight: 20 },
      { name: 'Technical Skills', description: 'Proficiency in technical areas', category: 'Technical', level: 'Advanced', weight: 25 },
      { name: 'Leadership', description: 'Ability to lead and manage teams', category: 'Leadership', level: 'Intermediate', weight: 20 },
      { name: 'Problem Solving', description: 'Analytical and problem-solving abilities', category: 'Core', level: 'Advanced', weight: 20 },
      { name: 'Teamwork', description: 'Collaboration and team building skills', category: 'Core', level: 'Intermediate', weight: 15 }
    ];

    for (const comp of competencies) {
      await prisma.competency.create({
        data: comp
      });
    }

    console.log('✅ Competencies created');

    // Create appraisal cycle
    console.log('🔄 Creating appraisal cycle...');

    const currentYear = new Date().getFullYear();
    const appraisalCycle = await prisma.appraisalCycle.create({
      data: {
        name: `${currentYear} Annual Performance Review`,
        startDate: new Date(currentYear, 0, 1), // January 1st
        endDate: new Date(currentYear, 11, 31), // December 31st
        status: 'ACTIVE'
      }
    });

    console.log('✅ Appraisal cycle created');

    // Create appraisal templates
    console.log('📋 Creating appraisal templates...');

    const templates = [
      {
        name: 'faculty-performance-appraisal-v1',
        displayName: 'Faculty Performance Appraisal',
        type: 'FACULTY',
        version: '1.0',
        configJson: {
          sections: [
            {
              id: 'teaching',
              title: 'Teaching Excellence',
              weight: 40,
              competencies: ['Communication Skills', 'Technical Skills']
            },
            {
              id: 'research',
              title: 'Research & Scholarship',
              weight: 30,
              competencies: ['Problem Solving', 'Technical Skills']
            },
            {
              id: 'service',
              title: 'Service & Leadership',
              weight: 30,
              competencies: ['Leadership', 'Teamwork']
            }
          ]
        }
      },
      {
        name: 'general-staff-appraisal-v1',
        displayName: 'General Staff Performance Appraisal',
        type: 'GENERAL_STAFF',
        version: '1.0',
        configJson: {
          sections: [
            {
              id: 'job-performance',
              title: 'Job Performance',
              weight: 50,
              competencies: ['Technical Skills', 'Problem Solving']
            },
            {
              id: 'communication',
              title: 'Communication & Collaboration',
              weight: 30,
              competencies: ['Communication Skills', 'Teamwork']
            },
            {
              id: 'professional-development',
              title: 'Professional Development',
              weight: 20,
              competencies: ['Technical Skills', 'Leadership']
            }
          ]
        }
      }
    ];

    for (const template of templates) {
      await prisma.appraisalTemplate.create({
        data: template
      });
    }

    console.log('✅ Appraisal templates created');

    console.log('\n🎉 MySQL database seeding completed successfully!');
    console.log('\nDemo credentials:');
    console.log('👤 Admin: admin@costaatt.edu.tt / password');
    console.log('👤 Supervisor: john.doe@costaatt.edu.tt / password');
    console.log('👤 Employee: mike.johnson@costaatt.edu.tt / password');
    console.log('\nYou can now login and test the application!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
