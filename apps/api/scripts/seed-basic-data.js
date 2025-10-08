const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedBasicData() {
  try {
    console.log('🚀 Seeding basic data...');

    // Create a few test employees
    const employees = [
      {
        email: 'kevin.jakhoo@costaatt.edu.tt',
        firstName: 'Kevin',
        lastName: 'Jakhoo',
        role: 'EMPLOYEE',
        dept: 'Technology Services',
        title: 'IT Support Specialist',
        division: 'Technology Services',
        employmentType: 'Full-time',
        employmentCategory: 'GENERAL_STAFF'
      },
      {
        email: 'deborah.romero@costaatt.edu.tt',
        firstName: 'Deborah',
        lastName: 'Romero',
        role: 'EMPLOYEE',
        dept: 'Technology Services',
        title: 'Administrative Assistant',
        division: 'Technology Services',
        employmentType: 'Full-time',
        employmentCategory: 'GENERAL_STAFF'
      },
      {
        email: 'manager@costaatt.edu.tt',
        firstName: 'John',
        lastName: 'Manager',
        role: 'SUPERVISOR',
        dept: 'Technology Services',
        title: 'IT Manager',
        division: 'Technology Services',
        employmentType: 'Full-time',
        employmentCategory: 'GENERAL_STAFF'
      }
    ];

    for (const emp of employees) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const user = await prisma.user.upsert({
        where: { email: emp.email },
        update: {},
        create: {
          email: emp.email,
          passwordHash: hashedPassword,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.role,
          dept: emp.dept,
          title: emp.title,
          active: true
        }
      });

      await prisma.employee.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          dept: emp.dept,
          division: emp.division,
          employmentType: emp.employmentType,
          employmentCategory: emp.employmentCategory
        }
      });

      console.log(`✅ Created employee: ${emp.firstName} ${emp.lastName}`);
    }

    // Create an appraisal cycle
    let cycle = await prisma.appraisalCycle.findFirst({
      where: { name: 'Annual Performance Review 2025' }
    });
    
    if (!cycle) {
      cycle = await prisma.appraisalCycle.create({
        data: {
          name: 'Annual Performance Review 2025',
          periodStart: new Date('2025-01-01'),
          periodEnd: new Date('2025-12-31'),
          status: 'ACTIVE'
        }
      });
    }

    // Create a basic template
    let template = await prisma.appraisalTemplate.findFirst({
      where: { name: 'General Staff Performance Appraisal' }
    });
    
    if (!template) {
      template = await prisma.appraisalTemplate.create({
        data: {
          name: 'General Staff Performance Appraisal',
          type: 'GENERAL_STAFF',
          configJson: {
            sections: [
              {
                id: 'performance',
                title: 'Performance Review',
                weight: 0.4,
                questions: [
                  { id: 'q1', text: 'How well did you perform your duties?', type: 'rating', weight: 1.0 }
                ]
              }
            ]
          },
          published: true
        }
      });
    }

    // Create a test appraisal instance
    const kevinUser = await prisma.user.findUnique({ where: { email: 'kevin.jakhoo@costaatt.edu.tt' } });
    const kevinEmployee = await prisma.employee.findUnique({ where: { userId: kevinUser.id } });
    const managerUser = await prisma.user.findUnique({ where: { email: 'manager@costaatt.edu.tt' } });

    let appraisal = await prisma.appraisalInstance.findUnique({
      where: { id: 'test-appraisal-1' }
    });
    
    if (!appraisal) {
      appraisal = await prisma.appraisalInstance.create({
        data: {
          id: 'test-appraisal-1',
          templateId: template.id,
          employeeId: kevinEmployee.id,
          cycleId: cycle.id,
          options: {},
          sections: {
            performance: {
              q1: { rating: 4, comment: 'Good performance' }
            }
          },
          status: 'IN_REVIEW',
          submittedAt: new Date(),
          createdBy: kevinUser.id,
          reviewerId: managerUser.id
        }
      });
    }

    console.log('✅ Created test appraisal instance');
    console.log('📊 Appraisal ID:', appraisal.id);
    console.log('👤 Employee:', kevinUser.firstName, kevinUser.lastName);
    console.log('👨‍💼 Manager:', managerUser.firstName, managerUser.lastName);
    console.log('📋 Status:', appraisal.status);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBasicData();
