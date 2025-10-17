const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleTemplates = [
  {
    name: 'faculty-appraisal-v1',
    displayName: 'Faculty Performance Appraisal',
    type: 'FACULTY',
    version: '1.0',
    configJson: {
      sections: [
        {
          id: 'teaching',
          title: 'Teaching Excellence',
          weight: 40,
          questions: [
            { id: 'q1', text: 'Quality of course delivery', type: 'rating', required: true },
            { id: 'q2', text: 'Student engagement and feedback', type: 'rating', required: true },
            { id: 'q3', text: 'Curriculum development contributions', type: 'rating', required: true }
          ]
        },
        {
          id: 'research',
          title: 'Research and Scholarship',
          weight: 30,
          questions: [
            { id: 'q4', text: 'Research publications and outputs', type: 'rating', required: true },
            { id: 'q5', text: 'Grant applications and funding', type: 'rating', required: true },
            { id: 'q6', text: 'Conference presentations', type: 'rating', required: true }
          ]
        },
        {
          id: 'service',
          title: 'Service and Administration',
          weight: 30,
          questions: [
            { id: 'q7', text: 'Committee participation', type: 'rating', required: true },
            { id: 'q8', text: 'Community service activities', type: 'rating', required: true },
            { id: 'q9', text: 'Administrative responsibilities', type: 'rating', required: true }
          ]
        }
      ]
    },
    published: true,
    active: true,
    code: 'faculty-v1'
  },
  {
    name: 'staff-appraisal-v1',
    displayName: 'General Staff Appraisal',
    type: 'GENERAL_STAFF',
    version: '1.0',
    configJson: {
      sections: [
        {
          id: 'performance',
          title: 'Job Performance',
          weight: 60,
          questions: [
            { id: 'q1', text: 'Quality of work output', type: 'rating', required: true },
            { id: 'q2', text: 'Meeting deadlines and targets', type: 'rating', required: true },
            { id: 'q3', text: 'Problem-solving abilities', type: 'rating', required: true }
          ]
        },
        {
          id: 'competencies',
          title: 'Core Competencies',
          weight: 40,
          questions: [
            { id: 'q4', text: 'Communication skills', type: 'rating', required: true },
            { id: 'q5', text: 'Teamwork and collaboration', type: 'rating', required: true },
            { id: 'q6', text: 'Professional development', type: 'rating', required: true }
          ]
        }
      ]
    },
    published: true,
    active: true,
    code: 'staff-v1'
  },
  {
    name: 'dean-appraisal-v1',
    displayName: 'Dean Performance Appraisal',
    type: 'DEAN',
    version: '1.0',
    configJson: {
      sections: [
        {
          id: 'leadership',
          title: 'Academic Leadership',
          weight: 35,
          questions: [
            { id: 'q1', text: 'Strategic vision and planning', type: 'rating', required: true },
            { id: 'q2', text: 'Faculty development and support', type: 'rating', required: true },
            { id: 'q3', text: 'Student success initiatives', type: 'rating', required: true }
          ]
        },
        {
          id: 'administration',
          title: 'Administrative Excellence',
          weight: 30,
          questions: [
            { id: 'q4', text: 'Budget management', type: 'rating', required: true },
            { id: 'q5', text: 'Resource allocation', type: 'rating', required: true },
            { id: 'q6', text: 'Policy implementation', type: 'rating', required: true }
          ]
        },
        {
          id: 'external',
          title: 'External Relations',
          weight: 20,
          questions: [
            { id: 'q7', text: 'Community engagement', type: 'rating', required: true },
            { id: 'q8', text: 'Partnership development', type: 'rating', required: true }
          ]
        },
        {
          id: 'research',
          title: 'Research and Scholarship',
          weight: 15,
          questions: [
            { id: 'q9', text: 'Research leadership', type: 'rating', required: true },
            { id: 'q10', text: 'Scholarly activities', type: 'rating', required: true }
          ]
        }
      ]
    },
    published: true,
    active: true,
    code: 'dean-v1'
  },
  {
    name: 'clinical-instructor-appraisal-v1',
    displayName: 'Clinical Instructor Performance Appraisal',
    type: 'CLINICAL_INSTRUCTOR',
    version: '1.0',
    configJson: {
      sections: [
        {
          id: 'clinical-teaching',
          title: 'Clinical Teaching Excellence',
          weight: 40,
          questions: [
            { id: 'q1', text: 'Clinical supervision quality', type: 'rating', required: true },
            { id: 'q2', text: 'Student mentoring effectiveness', type: 'rating', required: true },
            { id: 'q3', text: 'Clinical assessment methods', type: 'rating', required: true }
          ]
        },
        {
          id: 'professional-practice',
          title: 'Professional Practice',
          weight: 30,
          questions: [
            { id: 'q4', text: 'Clinical competence', type: 'rating', required: true },
            { id: 'q5', text: 'Evidence-based practice', type: 'rating', required: true },
            { id: 'q6', text: 'Patient safety commitment', type: 'rating', required: true }
          ]
        },
        {
          id: 'educational-leadership',
          title: 'Educational Leadership',
          weight: 20,
          questions: [
            { id: 'q7', text: 'Curriculum development', type: 'rating', required: true },
            { id: 'q8', text: 'Program coordination', type: 'rating', required: true }
          ]
        },
        {
          id: 'research',
          title: 'Research and Scholarship',
          weight: 10,
          questions: [
            { id: 'q9', text: 'Clinical research participation', type: 'rating', required: true },
            { id: 'q10', text: 'Professional development', type: 'rating', required: true }
          ]
        }
      ]
    },
    published: true,
    active: true,
    code: 'clinical-instructor-v1'
  },
  {
    name: 'executive-management-appraisal-v1',
    displayName: 'Executive Management Performance Appraisal',
    type: 'EXECUTIVE_MANAGEMENT',
    version: '1.0',
    configJson: {
      sections: [
        {
          id: 'strategic-leadership',
          title: 'Strategic Leadership',
          weight: 35,
          questions: [
            { id: 'q1', text: 'Vision development', type: 'rating', required: true },
            { id: 'q2', text: 'Strategic planning', type: 'rating', required: true },
            { id: 'q3', text: 'Change management', type: 'rating', required: true }
          ]
        },
        {
          id: 'operational-excellence',
          title: 'Operational Excellence',
          weight: 30,
          questions: [
            { id: 'q4', text: 'Performance management', type: 'rating', required: true },
            { id: 'q5', text: 'Resource optimization', type: 'rating', required: true },
            { id: 'q6', text: 'Process improvement', type: 'rating', required: true }
          ]
        },
        {
          id: 'stakeholder-relations',
          title: 'Stakeholder Relations',
          weight: 20,
          questions: [
            { id: 'q7', text: 'Board relations', type: 'rating', required: true },
            { id: 'q8', text: 'External partnerships', type: 'rating', required: true }
          ]
        },
        {
          id: 'financial-management',
          title: 'Financial Management',
          weight: 15,
          questions: [
            { id: 'q9', text: 'Budget oversight', type: 'rating', required: true },
            { id: 'q10', text: 'Revenue generation', type: 'rating', required: true }
          ]
        }
      ]
    },
    published: true,
    active: true,
    code: 'executive-management-v1'
  }
];

async function createSampleTemplates() {
  try {
    console.log('🚀 Creating sample appraisal templates...');
    
    for (const templateData of sampleTemplates) {
      try {
        // Check if template already exists
        const existing = await prisma.appraisalTemplate.findFirst({
          where: { code: templateData.code }
        });

        if (existing) {
          console.log(`⚠️  Template ${templateData.displayName} already exists, skipping...`);
          continue;
        }

        const template = await prisma.appraisalTemplate.create({
          data: templateData
        });

        console.log(`✅ Created ${template.displayName} template`);
      } catch (error) {
        console.error(`❌ Error creating ${templateData.displayName}:`, error.message);
      }
    }

    // Verify templates
    const templates = await prisma.appraisalTemplate.findMany();
    console.log(`\n🎉 Sample template creation completed!`);
    console.log(`📊 Total templates: ${templates.length}`);
    
    templates.forEach(template => {
      console.log(`- ${template.displayName} (${template.type}) - ${template.published ? 'Published' : 'Draft'}`);
    });

  } catch (error) {
    console.error('❌ Error creating sample templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleTemplates();
