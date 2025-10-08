const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Appraisal template configurations based on your specifications
const templateConfigs = {
  DEAN: {
    name: "Dean Performance Appraisal",
    type: "DEAN",
    displayName: "Dean Performance Evaluation",
    configJson: {
      sections: [
        {
          key: "leadership",
          title: "Leadership & Management",
          weight: 0.30,
          items: [
            {
              key: "strategic_vision",
              title: "Strategic Vision & Planning",
              scale: "1-5",
              weight: 0.40
            },
            {
              key: "team_leadership",
              title: "Team Leadership & Development",
              scale: "1-5",
              weight: 0.30
            },
            {
              key: "decision_making",
              title: "Decision Making & Problem Solving",
              scale: "1-5",
              weight: 0.30
            }
          ]
        },
        {
          key: "academic_excellence",
          title: "Academic Excellence",
          weight: 0.25,
          items: [
            {
              key: "curriculum_development",
              title: "Curriculum Development & Innovation",
              scale: "1-5",
              weight: 0.50
            },
            {
              key: "quality_assurance",
              title: "Quality Assurance & Standards",
              scale: "1-5",
              weight: 0.50
            }
          ]
        },
        {
          key: "stakeholder_engagement",
          title: "Stakeholder Engagement",
          weight: 0.20,
          items: [
            {
              key: "community_outreach",
              title: "Community Outreach & Partnerships",
              scale: "1-5",
              weight: 0.50
            },
            {
              key: "student_engagement",
              title: "Student Engagement & Support",
              scale: "1-5",
              weight: 0.50
            }
          ]
        },
        {
          key: "administrative_effectiveness",
          title: "Administrative Effectiveness",
          weight: 0.25,
          items: [
            {
              key: "resource_management",
              title: "Resource Management & Budgeting",
              scale: "1-5",
              weight: 0.40
            },
            {
              key: "compliance",
              title: "Compliance & Governance",
              scale: "1-5",
              weight: 0.30
            },
            {
              key: "technology_adoption",
              title: "Technology Adoption & Innovation",
              scale: "1-5",
              weight: 0.30
            }
          ]
        }
      ],
      scoring: {
        scale: "1-5",
        bands: {
          "5": { min: 4.5, max: 5.0, label: "Outstanding", color: "green" },
          "4": { min: 3.5, max: 4.4, label: "Exceeds Expectations", color: "blue" },
          "3": { min: 2.5, max: 3.4, label: "Meets Expectations", color: "yellow" },
          "2": { min: 1.5, max: 2.4, label: "Below Expectations", color: "orange" },
          "1": { min: 1.0, max: 1.4, label: "Unsatisfactory", color: "red" }
        }
      }
    }
  },

  FACULTY: {
    name: "Faculty Performance Appraisal",
    type: "FACULTY",
    displayName: "Faculty Performance Evaluation",
    configJson: {
      sections: [
        {
          key: "teaching_excellence",
          title: "Teaching Excellence",
          weight: 0.35,
          items: [
            {
              key: "instructional_design",
              title: "Instructional Design & Delivery",
              scale: "1-5",
              weight: 0.30
            },
            {
              key: "student_engagement",
              title: "Student Engagement & Interaction",
              scale: "1-5",
              weight: 0.25
            },
            {
              key: "assessment_methods",
              title: "Assessment Methods & Feedback",
              scale: "1-5",
              weight: 0.25
            },
            {
              key: "curriculum_innovation",
              title: "Curriculum Innovation & Development",
              scale: "1-5",
              weight: 0.20
            }
          ]
        },
        {
          key: "research_scholarship",
          title: "Research & Scholarship",
          weight: 0.25,
          items: [
            {
              key: "research_publications",
              title: "Research Publications & Outputs",
              scale: "1-5",
              weight: 0.40
            },
            {
              key: "grant_funding",
              title: "Grant Funding & Proposals",
              scale: "1-5",
              weight: 0.30
            },
            {
              key: "collaboration",
              title: "Research Collaboration & Networking",
              scale: "1-5",
              weight: 0.30
            }
          ]
        },
        {
          key: "service_contribution",
          title: "Service & Contribution",
          weight: 0.20,
          items: [
            {
              key: "departmental_service",
              title: "Departmental Service & Committees",
              scale: "1-5",
              weight: 0.40
            },
            {
              key: "community_service",
              title: "Community Service & Outreach",
              scale: "1-5",
              weight: 0.30
            },
            {
              key: "professional_development",
              title: "Professional Development & Growth",
              scale: "1-5",
              weight: 0.30
            }
          ]
        },
        {
          key: "student_evaluations",
          title: "Student Evaluations",
          weight: 0.20,
          items: [
            {
              key: "course_evaluations",
              title: "Course Evaluation Scores",
              scale: "1-5",
              weight: 0.60,
              dynamic: true,
              divisor: "student_count"
            },
            {
              key: "student_feedback",
              title: "Student Feedback & Comments",
              scale: "1-5",
              weight: 0.40
            }
          ]
        }
      ],
      scoring: {
        scale: "1-5",
        bands: {
          "5": { min: 4.5, max: 5.0, label: "Outstanding", color: "green" },
          "4": { min: 3.5, max: 4.4, label: "Exceeds Expectations", color: "blue" },
          "3": { min: 2.5, max: 3.4, label: "Meets Expectations", color: "yellow" },
          "2": { min: 1.5, max: 2.4, label: "Below Expectations", color: "orange" },
          "1": { min: 1.0, max: 1.4, label: "Unsatisfactory", color: "red" }
        }
      }
    }
  },

  CLINICAL: {
    name: "Clinical Performance Appraisal",
    type: "CLINICAL",
    displayName: "Clinical Performance Evaluation",
    configJson: {
      sections: [
        {
          key: "clinical_competence",
          title: "Clinical Competence",
          weight: 0.30,
          items: [
            {
              key: "patient_care",
              title: "Patient Care & Safety",
              scale: "1-5",
              weight: 0.40
            },
            {
              key: "clinical_skills",
              title: "Clinical Skills & Procedures",
              scale: "1-5",
              weight: 0.30
            },
            {
              key: "diagnostic_accuracy",
              title: "Diagnostic Accuracy & Assessment",
              scale: "1-5",
              weight: 0.30
            }
          ]
        },
        {
          key: "teaching_mentoring",
          title: "Teaching & Mentoring",
          weight: 0.25,
          items: [
            {
              key: "clinical_teaching",
              title: "Clinical Teaching & Supervision",
              scale: "1-5",
              weight: 0.50
            },
            {
              key: "student_mentoring",
              title: "Student Mentoring & Development",
              scale: "1-5",
              weight: 0.50
            }
          ]
        },
        {
          key: "professional_development",
          title: "Professional Development",
          weight: 0.20,
          items: [
            {
              key: "continuing_education",
              title: "Continuing Education & Training",
              scale: "1-5",
              weight: 0.40
            },
            {
              key: "certification_maintenance",
              title: "Certification & License Maintenance",
              scale: "1-5",
              weight: 0.30
            },
            {
              key: "research_participation",
              title: "Research Participation & Contribution",
              scale: "1-5",
              weight: 0.30
            }
          ]
        },
        {
          key: "collaboration_communication",
          title: "Collaboration & Communication",
          weight: 0.25,
          items: [
            {
              key: "team_collaboration",
              title: "Team Collaboration & Communication",
              scale: "1-5",
              weight: 0.40
            },
            {
              key: "interdisciplinary_work",
              title: "Interdisciplinary Teamwork",
              scale: "1-5",
              weight: 0.30
            },
            {
              key: "patient_communication",
              title: "Patient & Family Communication",
              scale: "1-5",
              weight: 0.30
            }
          ]
        }
      ],
      scoring: {
        scale: "1-5",
        bands: {
          "5": { min: 4.5, max: 5.0, label: "Outstanding", color: "green" },
          "4": { min: 3.5, max: 4.4, label: "Exceeds Expectations", color: "blue" },
          "3": { min: 2.5, max: 3.4, label: "Meets Expectations", color: "yellow" },
          "2": { min: 1.5, max: 2.4, label: "Below Expectations", color: "orange" },
          "1": { min: 1.0, max: 1.4, label: "Unsatisfactory", color: "red" }
        }
      }
    }
  }
};

async function seedAppraisalTemplates() {
  try {
    console.log('🚀 Starting appraisal template seeding...');
    
    // Check existing templates
    const existingTemplates = await prisma.appraisalTemplate.findMany();
    console.log(`📊 Found ${existingTemplates.length} existing templates`);
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const [type, config] of Object.entries(templateConfigs)) {
      try {
        // Check if template already exists
        const existingTemplate = await prisma.appraisalTemplate.findFirst({
          where: { type: config.type }
        });

        if (existingTemplate) {
          // Update existing template
          const template = await prisma.appraisalTemplate.update({
            where: { id: existingTemplate.id },
            data: {
              name: config.name,
              displayName: config.displayName,
              version: "1.0",
              configJson: config.configJson
            }
          });
          console.log(`🔄 Updated ${config.name} template`);
          updatedCount++;
        } else {
          // Create new template
          const template = await prisma.appraisalTemplate.create({
            data: {
              name: config.name,
              type: config.type,
              displayName: config.displayName,
              version: "1.0",
              configJson: config.configJson
            }
          });
          console.log(`✅ Created ${config.name} template`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${config.name} template:`, error.message);
      }
    }
    
    console.log('🎉 Appraisal template seeding completed!');
    console.log(`📊 Templates created: ${createdCount}`);
    console.log(`🔄 Templates updated: ${updatedCount}`);
    
    // Verify templates
    const templates = await prisma.appraisalTemplate.findMany();
    console.log('\n📋 Created templates:');
    templates.forEach(template => {
      console.log(`- ${template.displayName} (${template.type})`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedAppraisalTemplates();
