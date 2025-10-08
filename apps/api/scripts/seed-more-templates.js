const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedMoreTemplates() {
  console.log('🌱 Seeding more appraisal templates...');

  const templates = [
    {
      name: 'Academic Staff Performance Appraisal',
      code: 'ACADEMIC_2025',
      type: 'FACULTY',
      configJson: {
        sections: [
          {
            id: 'teaching',
            title: 'Teaching Excellence',
            weight: 0.4,
            questions: [
              {
                id: 'q1',
                text: 'How effective was your teaching delivery?',
                type: 'rating',
                weight: 1
              },
              {
                id: 'q2',
                text: 'Student feedback and engagement',
                type: 'rating',
                weight: 1
              }
            ]
          },
          {
            id: 'research',
            title: 'Research & Scholarship',
            weight: 0.3,
            questions: [
              {
                id: 'q3',
                text: 'Research output and publications',
                type: 'rating',
                weight: 1
              }
            ]
          },
          {
            id: 'service',
            title: 'Service & Administration',
            weight: 0.3,
            questions: [
              {
                id: 'q4',
                text: 'Committee participation and service',
                type: 'rating',
                weight: 1
              }
            ]
          }
        ]
      },
      published: true
    },
    {
      name: 'Executive Performance Appraisal',
      code: 'EXECUTIVE_2025',
      type: 'EXECUTIVE',
      configJson: {
        sections: [
          {
            id: 'leadership',
            title: 'Leadership & Vision',
            weight: 0.4,
            questions: [
              {
                id: 'q1',
                text: 'Strategic leadership effectiveness',
                type: 'rating',
                weight: 1
              },
              {
                id: 'q2',
                text: 'Team building and development',
                type: 'rating',
                weight: 1
              }
            ]
          },
          {
            id: 'management',
            title: 'Management Excellence',
            weight: 0.3,
            questions: [
              {
                id: 'q3',
                text: 'Operational efficiency and results',
                type: 'rating',
                weight: 1
              }
            ]
          },
          {
            id: 'innovation',
            title: 'Innovation & Growth',
            weight: 0.3,
            questions: [
              {
                id: 'q4',
                text: 'Innovation and continuous improvement',
                type: 'rating',
                weight: 1
              }
            ]
          }
        ]
      },
      published: true
    },
    {
      name: 'Support Staff Performance Appraisal',
      code: 'SUPPORT_2025',
      type: 'GENERAL_STAFF',
      configJson: {
        sections: [
          {
            id: 'technical',
            title: 'Technical Competence',
            weight: 0.4,
            questions: [
              {
                id: 'q1',
                text: 'Technical skills and knowledge',
                type: 'rating',
                weight: 1
              }
            ]
          },
          {
            id: 'service',
            title: 'Customer Service',
            weight: 0.3,
            questions: [
              {
                id: 'q2',
                text: 'Service delivery and customer satisfaction',
                type: 'rating',
                weight: 1
              }
            ]
          },
          {
            id: 'collaboration',
            title: 'Teamwork & Collaboration',
            weight: 0.3,
            questions: [
              {
                id: 'q3',
                text: 'Team collaboration and communication',
                type: 'rating',
                weight: 1
              }
            ]
          }
        ]
      },
      published: true
    },
    {
      name: 'Probationary Review Template',
      code: 'PROBATION_2025',
      type: 'GENERAL_STAFF',
      configJson: {
        sections: [
          {
            id: 'adaptation',
            title: 'Adaptation to Role',
            weight: 0.5,
            questions: [
              {
                id: 'q1',
                text: 'How well has the employee adapted to their role?',
                type: 'rating',
                weight: 1
              }
            ]
          },
          {
            id: 'performance',
            title: 'Performance Standards',
            weight: 0.5,
            questions: [
              {
                id: 'q2',
                text: 'Meeting performance expectations',
                type: 'rating',
                weight: 1
              }
            ]
          }
        ]
      },
      published: true
    }
  ];

  for (const template of templates) {
    try {
      await prisma.appraisalTemplate.upsert({
        where: { code: template.code },
        update: template,
        create: template
      });
      console.log(`✅ Created/Updated template: ${template.name}`);
    } catch (error) {
      console.error(`❌ Error creating template ${template.name}:`, error);
    }
  }

  console.log('🎉 Template seeding completed!');
}

seedMoreTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
