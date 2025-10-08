const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Comprehensive template configurations for all 5 appraisal types
const templateConfigs = {
  DEAN: {
    name: "Dean Performance Appraisal",
    type: "DEAN",
    displayName: "Dean Performance Evaluation",
    version: "1.0",
    configJson: {
      sections: [
        {
          key: "functional",
          title: "Functional Performance",
          weight: 0.50,
          divisor: 117,
          items: [
            {
              key: "strategic_vision",
              title: "Strategic Vision & Planning",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "leadership_effectiveness",
              title: "Leadership Effectiveness",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "academic_management",
              title: "Academic Management",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "stakeholder_engagement",
              title: "Stakeholder Engagement",
              scale: "1-3",
              weight: 0.25
            }
          ]
        },
        {
          key: "core",
          title: "Core Competencies",
          weight: 0.30,
          divisor: 99,
          items: [
            {
              key: "communication",
              title: "Communication Skills",
              scale: "1-3",
              weight: 0.33
            },
            {
              key: "decision_making",
              title: "Decision Making",
              scale: "1-3",
              weight: 0.33
            },
            {
              key: "team_building",
              title: "Team Building",
              scale: "1-3",
              weight: 0.34
            }
          ]
        },
        {
          key: "projects",
          title: "Strategic Projects",
          weight: 0.20,
          divisor: "4 * N", // 4 × number of projects
          items: [
            {
              key: "project_management",
              title: "Project Management",
              scale: "0-4",
              weight: 1.0
            }
          ]
        }
      ],
      scoring: {
        weights: {
          functional: 0.50,
          core: 0.30,
          projects: 0.20,
          studentEvaluations: 0.0
        },
        finalBands: [
          { label: "Outstanding", min: 0.90, max: 1.00 },
          { label: "Very Good", min: 0.70, max: 0.89 },
          { label: "Good", min: 0.56, max: 0.69 },
          { label: "Fair", min: 0.40, max: 0.55 },
          { label: "Unsatisfactory", min: 0.00, max: 0.39 }
        ]
      },
      options: {
        allowSelfAssessment: true,
        allowPeerFeedback: true,
        allowStudentEvaluations: false,
        allowProjectsBlock: true
      }
    }
  },

  FACULTY: {
    name: "Faculty Performance Appraisal",
    type: "FACULTY",
    displayName: "Faculty Performance Evaluation",
    version: "1.0",
    configJson: {
      sections: [
        {
          key: "functional",
          title: "Functional Performance",
          weight: 0.50,
          divisor: 114,
          items: [
            {
              key: "teaching_excellence",
              title: "Teaching Excellence",
              scale: "1-3",
              weight: 0.30
            },
            {
              key: "curriculum_development",
              title: "Curriculum Development",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "research_contribution",
              title: "Research Contribution",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "service_contribution",
              title: "Service Contribution",
              scale: "1-3",
              weight: 0.20
            }
          ]
        },
        {
          key: "core",
          title: "Core Competencies",
          weight: 0.30,
          divisor: 99,
          items: [
            {
              key: "communication",
              title: "Communication Skills",
              scale: "1-3",
              weight: 0.33
            },
            {
              key: "collaboration",
              title: "Collaboration",
              scale: "1-3",
              weight: 0.33
            },
            {
              key: "professional_development",
              title: "Professional Development",
              scale: "1-3",
              weight: 0.34
            }
          ]
        },
        {
          key: "studentEvaluations",
          title: "Student Evaluations",
          weight: 0.20,
          divisor: "5 * N", // 5 × number of courses
          items: [
            {
              key: "student_feedback",
              title: "Student Feedback",
              scale: "0-5",
              weight: 1.0
            }
          ]
        }
      ],
      scoring: {
        weights: {
          functional: 0.50,
          core: 0.30,
          projects: 0.05,
          studentEvaluations: 0.15
        },
        finalBands: [
          { label: "Outstanding", min: 0.90, max: 1.00 },
          { label: "Very Good", min: 0.70, max: 0.89 },
          { label: "Good", min: 0.56, max: 0.69 },
          { label: "Fair", min: 0.40, max: 0.55 },
          { label: "Unsatisfactory", min: 0.00, max: 0.39 }
        ]
      },
      options: {
        allowSelfAssessment: true,
        allowPeerFeedback: true,
        allowStudentEvaluations: true,
        allowProjectsBlock: true
      }
    }
  },

  CLINICAL: {
    name: "Clinical Performance Appraisal",
    type: "CLINICAL",
    displayName: "Clinical Performance Evaluation",
    version: "1.0",
    configJson: {
      sections: [
        {
          key: "functional",
          title: "Functional Performance",
          weight: 0.60,
          divisor: 81,
          items: [
            {
              key: "clinical_skills",
              title: "Clinical Skills",
              scale: "1-3",
              weight: 0.30
            },
            {
              key: "patient_care",
              title: "Patient Care",
              scale: "1-3",
              weight: 0.30
            },
            {
              key: "clinical_teaching",
              title: "Clinical Teaching",
              scale: "1-3",
              weight: 0.20
            },
            {
              key: "professional_development",
              title: "Professional Development",
              scale: "1-3",
              weight: 0.20
            }
          ]
        },
        {
          key: "core",
          title: "Core Competencies",
          weight: 0.20,
          divisor: 72,
          items: [
            {
              key: "communication",
              title: "Communication Skills",
              scale: "1-3",
              weight: 0.50
            },
            {
              key: "teamwork",
              title: "Teamwork",
              scale: "1-3",
              weight: 0.50
            }
          ]
        },
        {
          key: "studentEvaluations",
          title: "Student Evaluations",
          weight: 0.20,
          divisor: "5 * N", // 5 × number of courses (max 6)
          items: [
            {
              key: "student_feedback",
              title: "Student Feedback",
              scale: "0-5",
              weight: 1.0
            }
          ]
        }
      ],
      scoring: {
        weights: {
          functional: 0.60,
          core: 0.20,
          projects: 0.0,
          studentEvaluations: 0.20
        },
        finalBands: [
          { label: "Outstanding", min: 0.90, max: 1.00 },
          { label: "Very Good", min: 0.70, max: 0.89 },
          { label: "Good", min: 0.56, max: 0.69 },
          { label: "Fair", min: 0.40, max: 0.55 },
          { label: "Unsatisfactory", min: 0.00, max: 0.39 }
        ]
      },
      options: {
        allowSelfAssessment: true,
        allowPeerFeedback: true,
        allowStudentEvaluations: true,
        allowProjectsBlock: false
      }
    }
  },

  GENERAL_STAFF: {
    name: "General Staff Performance Appraisal",
    type: "GENERAL_STAFF",
    displayName: "General Staff Performance Evaluation",
    version: "1.0",
    configJson: {
      sections: [
        {
          key: "functional",
          title: "Functional Performance",
          weight: 0.60,
          divisor: 100,
          items: [
            {
              key: "job_performance",
              title: "Job Performance",
              scale: "1-3",
              weight: 0.40
            },
            {
              key: "productivity",
              title: "Productivity",
              scale: "1-3",
              weight: 0.30
            },
            {
              key: "quality_work",
              title: "Quality of Work",
              scale: "1-3",
              weight: 0.30
            }
          ]
        },
        {
          key: "core",
          title: "Core Competencies",
          weight: 0.40,
          divisor: 100,
          items: [
            {
              key: "communication",
              title: "Communication Skills",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "teamwork",
              title: "Teamwork",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "initiative",
              title: "Initiative",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "reliability",
              title: "Reliability",
              scale: "1-3",
              weight: 0.25
            }
          ]
        }
      ],
      scoring: {
        weights: {
          functional: 0.60,
          core: 0.40,
          projects: 0.0,
          studentEvaluations: 0.0
        },
        finalBands: [
          { label: "Outstanding", min: 0.90, max: 1.00 },
          { label: "Very Good", min: 0.70, max: 0.89 },
          { label: "Good", min: 0.56, max: 0.69 },
          { label: "Fair", min: 0.40, max: 0.55 },
          { label: "Unsatisfactory", min: 0.00, max: 0.39 }
        ]
      },
      options: {
        allowSelfAssessment: true,
        allowPeerFeedback: false,
        allowStudentEvaluations: false,
        allowProjectsBlock: false
      }
    }
  },

  EXECUTIVE: {
    name: "Executive Management Performance Appraisal",
    type: "EXECUTIVE",
    displayName: "Executive Management Performance Evaluation",
    version: "1.0",
    configJson: {
      sections: [
        {
          key: "functional",
          title: "Functional Performance",
          weight: 0.50,
          divisor: 100,
          items: [
            {
              key: "strategic_leadership",
              title: "Strategic Leadership",
              scale: "1-3",
              weight: 0.30
            },
            {
              key: "organizational_management",
              title: "Organizational Management",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "financial_management",
              title: "Financial Management",
              scale: "1-3",
              weight: 0.25
            },
            {
              key: "stakeholder_relations",
              title: "Stakeholder Relations",
              scale: "1-3",
              weight: 0.20
            }
          ]
        },
        {
          key: "core",
          title: "Core Competencies",
          weight: 0.30,
          divisor: 100,
          items: [
            {
              key: "vision_communication",
              title: "Vision Communication",
              scale: "1-3",
              weight: 0.33
            },
            {
              key: "decision_making",
              title: "Decision Making",
              scale: "1-3",
              weight: 0.33
            },
            {
              key: "change_management",
              title: "Change Management",
              scale: "1-3",
              weight: 0.34
            }
          ]
        },
        {
          key: "projects",
          title: "Strategic Projects",
          weight: 0.20,
          divisor: "4 * N", // 4 × number of projects
          items: [
            {
              key: "project_leadership",
              title: "Project Leadership",
              scale: "0-4",
              weight: 1.0
            }
          ]
        }
      ],
      scoring: {
        weights: {
          functional: 0.50,
          core: 0.30,
          projects: 0.20,
          studentEvaluations: 0.0
        },
        finalBands: [
          { label: "Outstanding", min: 0.90, max: 1.00 },
          { label: "Very Good", min: 0.70, max: 0.89 },
          { label: "Good", min: 0.56, max: 0.69 },
          { label: "Fair", min: 0.40, max: 0.55 },
          { label: "Unsatisfactory", min: 0.00, max: 0.39 }
        ]
      },
      options: {
        allowSelfAssessment: true,
        allowPeerFeedback: true,
        allowStudentEvaluations: false,
        allowProjectsBlock: true
      }
    }
  }
};

async function seedComprehensiveTemplates() {
  try {
    console.log('🚀 Starting comprehensive template seeding...');

    const existingTemplates = await prisma.appraisalTemplate.findMany();
    console.log(`📊 Found ${existingTemplates.length} existing templates`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const [type, config] of Object.entries(templateConfigs)) {
      try {
        const existingTemplate = await prisma.appraisalTemplate.findFirst({
          where: { type: config.type }
        });

        if (existingTemplate) {
          const template = await prisma.appraisalTemplate.update({
            where: { id: existingTemplate.id },
            data: {
              code: config.type.toLowerCase(),
              name: config.name,
              displayName: config.displayName,
              version: config.version,
              configJson: config.configJson
            }
          });
          console.log(`🔄 Updated ${config.displayName} template`);
          updatedCount++;
        } else {
          const template = await prisma.appraisalTemplate.create({
            data: {
              code: config.type.toLowerCase(),
              name: config.name,
              type: config.type,
              displayName: config.displayName,
              version: config.version,
              configJson: config.configJson
            }
          });
          console.log(`✅ Created ${config.displayName} template`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${config.displayName} template:`, error.message);
      }
    }

    console.log('🎉 Comprehensive template seeding completed!');
    console.log(`📊 Templates created: ${createdCount}`);
    console.log(`🔄 Templates updated: ${updatedCount}`);

    const templates = await prisma.appraisalTemplate.findMany();
    console.log('\n📋 Available templates:');
    templates.forEach(template => {
      console.log(`- ${template.displayName || template.name} (${template.type}) - v${template.version}`);
    });

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedComprehensiveTemplates();
