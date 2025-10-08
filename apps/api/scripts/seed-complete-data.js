const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedCompleteData() {
  try {
    console.log('🌱 Starting complete data seeding...');

    // 1. Seed Appraisal Cycles
    console.log('📅 Creating appraisal cycles...');
    const cycles = [
      {
        name: '2024 Annual Performance Review',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-12-31'),
        status: 'ACTIVE'
      },
      {
        name: '2024 Mid-Year Review',
        periodStart: new Date('2024-06-01'),
        periodEnd: new Date('2024-08-31'),
        status: 'ACTIVE'
      },
      {
        name: '2025 Annual Performance Review',
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-12-31'),
        status: 'PLANNED'
      }
    ];

    for (const cycle of cycles) {
      const existing = await prisma.appraisalCycle.findFirst({
        where: { name: cycle.name }
      });
      
      if (!existing) {
        await prisma.appraisalCycle.create({
          data: cycle
        });
      }
    }

    // 2. Seed Competencies
    console.log('🎯 Creating competencies...');
    const competencies = [
      // Academic Competencies
      {
        code: 'TEACH_EXCELLENCE',
        title: 'Teaching Excellence',
        cluster: 'CORE',
        department: 'Academic Affairs',
        definition: 'Demonstrates effective teaching methods and student engagement',
        behaviorsBasic: 'Uses standard teaching methods and maintains basic student engagement',
        behaviorsAbove: 'Uses innovative teaching methods and maintains high student engagement',
        behaviorsOutstanding: 'Pioneers new teaching approaches and achieves exceptional student outcomes'
      },
      {
        code: 'RESEARCH_SCHOLARSHIP',
        title: 'Research and Scholarship',
        cluster: 'CORE',
        department: 'Academic Affairs',
        definition: 'Conducts meaningful research and contributes to academic knowledge',
        behaviorsBasic: 'Participates in research activities and maintains basic scholarly output',
        behaviorsAbove: 'Publishes in peer-reviewed journals and secures research funding',
        behaviorsOutstanding: 'Leads major research initiatives and mentors research students'
      },
      {
        code: 'CURRICULUM_DEV',
        title: 'Curriculum Development',
        cluster: 'CORE',
        department: 'Academic Affairs',
        definition: 'Develops and maintains relevant curriculum content',
        behaviorsBasic: 'Updates course materials and maintains curriculum standards',
        behaviorsAbove: 'Designs innovative course materials and integrates technology',
        behaviorsOutstanding: 'Pioneers new curriculum approaches and leads program development'
      },
      {
        code: 'STUDENT_ASSESSMENT',
        title: 'Student Assessment',
        cluster: 'CORE',
        department: 'Academic Affairs',
        definition: 'Develops fair and effective assessment methods',
        behaviorsBasic: 'Uses standard assessment methods and provides basic feedback',
        behaviorsAbove: 'Creates innovative assessment tools and provides comprehensive feedback',
        behaviorsOutstanding: 'Develops new assessment frameworks and mentors others in assessment'
      },
      // Administrative Competencies
      {
        code: 'LEADERSHIP_MGMT',
        title: 'Leadership and Management',
        cluster: 'FUNCTIONAL',
        department: 'Administration',
        definition: 'Demonstrates effective leadership and management skills',
        behaviorsBasic: 'Manages day-to-day operations and maintains team productivity',
        behaviorsAbove: 'Leads team effectively and makes sound strategic decisions',
        behaviorsOutstanding: 'Transforms organizational culture and develops future leaders'
      },
      {
        code: 'STRATEGIC_PLANNING',
        title: 'Strategic Planning',
        cluster: 'FUNCTIONAL',
        department: 'Administration',
        definition: 'Contributes to organizational strategic planning',
        behaviorsBasic: 'Participates in planning activities and follows established processes',
        behaviorsAbove: 'Develops strategic initiatives and aligns with institutional goals',
        behaviorsOutstanding: 'Leads strategic transformation and shapes institutional direction'
      },
      {
        code: 'COMMUNICATION',
        title: 'Communication Skills',
        cluster: 'CORE',
        department: 'Administration',
        definition: 'Communicates effectively with various stakeholders',
        behaviorsBasic: 'Communicates clearly and listens to feedback',
        behaviorsAbove: 'Adapts communication style and presents information effectively',
        behaviorsOutstanding: 'Influences organizational communication and mentors others'
      },
      {
        code: 'PROBLEM_SOLVING',
        title: 'Problem Solving',
        cluster: 'FUNCTIONAL',
        department: 'Administration',
        definition: 'Identifies and resolves complex problems',
        behaviorsBasic: 'Identifies problems and applies standard solutions',
        behaviorsAbove: 'Develops creative solutions and implements them effectively',
        behaviorsOutstanding: 'Anticipates problems and develops systemic solutions'
      },
      // Technical Competencies
      {
        code: 'TECH_INTEGRATION',
        title: 'Technology Integration',
        cluster: 'FUNCTIONAL',
        department: 'IT Services',
        definition: 'Effectively integrates technology in work processes',
        behaviorsBasic: 'Uses standard software tools and follows established procedures',
        behaviorsAbove: 'Adapts to new technologies and troubleshoots technical issues',
        behaviorsOutstanding: 'Pioneers technology adoption and trains others effectively'
      },
      {
        code: 'DATA_ANALYSIS',
        title: 'Data Analysis',
        cluster: 'FUNCTIONAL',
        department: 'IT Services',
        definition: 'Analyzes data to inform decision-making',
        behaviorsBasic: 'Collects data and performs basic analysis',
        behaviorsAbove: 'Uses advanced analysis methods and interprets results accurately',
        behaviorsOutstanding: 'Develops analytical frameworks and guides organizational data strategy'
      }
    ];

    for (const competency of competencies) {
      const existing = await prisma.competency.findFirst({
        where: { code: competency.code }
      });
      
      if (!existing) {
        await prisma.competency.create({
          data: competency
        });
      }
    }

    // 3. Seed Appraisal Templates
    console.log('📋 Creating appraisal templates...');
    const templates = [
      {
        name: 'Academic Staff Performance Review',
        type: 'FACULTY',
        code: 'ACAD_2024',
        displayName: 'Academic Staff Performance Review',
        configJson: {
          sections: [
            {
              name: 'Teaching Performance',
              weight: 40,
              criteria: [
                { name: 'Teaching Excellence', weight: 50 },
                { name: 'Curriculum Development', weight: 30 },
                { name: 'Student Assessment', weight: 20 }
              ]
            },
            {
              name: 'Research and Scholarship',
              weight: 30,
              criteria: [
                { name: 'Research and Scholarship', weight: 100 }
              ]
            },
            {
              name: 'Service and Administration',
              weight: 20,
              criteria: [
                { name: 'Leadership and Management', weight: 40 },
                { name: 'Communication Skills', weight: 30 },
                { name: 'Problem Solving', weight: 30 }
              ]
            },
            {
              name: 'Professional Development',
              weight: 10,
              criteria: [
                { name: 'Technology Integration', weight: 50 },
                { name: 'Data Analysis', weight: 50 }
              ]
            }
          ]
        },
        published: true
      },
      {
        name: 'Administrative Staff Performance Review',
        type: 'GENERAL_STAFF',
        code: 'ADMIN_2024',
        displayName: 'Administrative Staff Performance Review',
        configJson: {
          sections: [
            {
              name: 'Core Administrative Functions',
              weight: 50,
              criteria: [
                { name: 'Leadership and Management', weight: 40 },
                { name: 'Communication Skills', weight: 30 },
                { name: 'Problem Solving', weight: 30 }
              ]
            },
            {
              name: 'Strategic Contribution',
              weight: 30,
              criteria: [
                { name: 'Strategic Planning', weight: 100 }
              ]
            },
            {
              name: 'Technical Proficiency',
              weight: 20,
              criteria: [
                { name: 'Technology Integration', weight: 50 },
                { name: 'Data Analysis', weight: 50 }
              ]
            }
          ]
        },
        published: true
      },
      {
        name: 'Support Staff Performance Review',
        type: 'GENERAL_STAFF',
        code: 'SUPPORT_2024',
        displayName: 'Support Staff Performance Review',
        configJson: {
          sections: [
            {
              name: 'Job Performance',
              weight: 60,
              criteria: [
                { name: 'Communication Skills', weight: 40 },
                { name: 'Problem Solving', weight: 30 },
                { name: 'Technology Integration', weight: 30 }
              ]
            },
            {
              name: 'Team Contribution',
              weight: 25,
              criteria: [
                { name: 'Leadership and Management', weight: 50 },
                { name: 'Data Analysis', weight: 50 }
              ]
            },
            {
              name: 'Professional Development',
              weight: 15,
              criteria: [
                { name: 'Strategic Planning', weight: 100 }
              ]
            }
          ]
        },
        published: true
      }
    ];

    for (const template of templates) {
      const existing = await prisma.appraisalTemplate.findFirst({
        where: { code: template.code }
      });
      
      if (!existing) {
        await prisma.appraisalTemplate.create({
          data: template
        });
      }
    }

    // 4. Import Staff from CSV
    console.log('👥 Importing staff from CSV...');
    const csvPath = path.join(__dirname, '..', 'data', 'complete_staff.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      let importedCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const employeeData = {};
          
          headers.forEach((header, index) => {
            employeeData[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
          });
          
          try {
            // Create employee
            const employee = await prisma.employee.create({
              data: {
                employeeId: employeeData.employeeid || `EMP${String(importedCount + 1).padStart(4, '0')}`,
                firstName: employeeData.firstname || 'Unknown',
                lastName: employeeData.lastname || 'Employee',
                email: employeeData.email || `employee${importedCount + 1}@costaatt.edu.tt`,
                division: employeeData.division || 'General',
                employmentType: employeeData.employmenttype || 'FULL_TIME',
                position: employeeData.position || 'Staff',
                hireDate: employeeData.hiredate ? new Date(employeeData.hiredate) : new Date(),
                managerId: null, // Will be set later if needed
                active: true
              }
            });
            
            // Create corresponding user
            await prisma.user.create({
              data: {
                email: employee.email,
                firstName: employee.firstName,
                lastName: employee.lastName,
                role: 'EMPLOYEE',
                authProvider: 'SSO',
                dept: employee.division,
                title: employee.position,
                active: true
              }
            });
            
            importedCount++;
            
            if (importedCount % 50 === 0) {
              console.log(`📊 Imported ${importedCount} employees...`);
            }
          } catch (error) {
            console.log(`⚠️  Skipped employee ${i}: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ Imported ${importedCount} employees from CSV`);
    } else {
      console.log('⚠️  CSV file not found, creating sample employees...');
      
      // Create sample employees if CSV not found
      const sampleEmployees = [
        {
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@costaatt.edu.tt',
          division: 'Academic Affairs',
          employmentType: 'FULL_TIME',
          position: 'Professor',
          hireDate: new Date('2020-01-15'),
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
          active: true
        }
      ];

      for (const emp of sampleEmployees) {
        const employee = await prisma.employee.create({
          data: emp
        });

        await prisma.user.create({
          data: {
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            role: 'EMPLOYEE',
            authProvider: 'SSO',
            dept: employee.division,
            title: employee.position,
            active: true
          }
        });
      }
    }

    console.log('✅ Complete data seeding finished!');
    console.log('📊 Summary:');
    console.log(`   - Appraisal Cycles: ${cycles.length}`);
    console.log(`   - Competencies: ${competencies.length}`);
    console.log(`   - Appraisal Templates: ${templates.length}`);
    console.log(`   - Employees: Check database`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompleteData();
