const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Academic-focused competency data for COSTAATT
const academicCompetenciesData = [
  {
    name: "Teaching Excellence",
    area: "Academic Excellence",
    description: "Demonstrates exceptional teaching skills, student engagement, and pedagogical innovation",
    basicBehaviours: "Delivers clear lectures, responds to student questions, follows curriculum guidelines",
    aboveBehaviours: "Uses innovative teaching methods, adapts to diverse learning styles, mentors junior faculty",
    outstandingBehaviours: "Develops new teaching methodologies, recognized as teaching expert, transforms student outcomes"
  },
  {
    name: "Research & Development",
    area: "Academic Excellence", 
    description: "Conducts meaningful research, contributes to knowledge advancement, and applies findings",
    basicBehaviours: "Participates in research projects, publishes findings, attends conferences",
    aboveBehaviours: "Leads research initiatives, secures funding, collaborates across disciplines",
    outstandingBehaviours: "Pioneers breakthrough research, influences policy, creates research centers"
  },
  {
    name: "Student Mentorship",
    area: "Academic Excellence",
    description: "Provides guidance, support, and development opportunities for student success",
    basicBehaviours: "Provides academic guidance, offers office hours, supports student projects",
    aboveBehaviours: "Develops mentorship programs, guides research projects, advocates for students",
    outstandingBehaviours: "Transforms student trajectories, creates mentorship networks, influences student success"
  },
  {
    name: "Curriculum Innovation",
    area: "Academic Excellence",
    description: "Develops and implements innovative curriculum that meets industry needs",
    basicBehaviours: "Updates course content, incorporates new technologies, aligns with standards",
    aboveBehaviours: "Designs new programs, integrates industry partnerships, leads curriculum committees",
    outstandingBehaviours: "Creates transformative programs, influences national standards, drives educational change"
  },
  {
    name: "Community Engagement",
    area: "Service Excellence",
    description: "Actively contributes to community development and social impact",
    basicBehaviours: "Participates in community events, serves on committees, supports local initiatives",
    aboveBehaviours: "Leads community projects, builds partnerships, creates social impact programs",
    outstandingBehaviours: "Transforms communities, creates lasting partnerships, drives social change"
  },
  {
    name: "Digital Literacy",
    area: "Professional Skills",
    description: "Demonstrates proficiency in digital tools and technology integration",
    basicBehaviours: "Uses standard software, participates in online platforms, adapts to new tools",
    aboveBehaviours: "Integrates technology in teaching, develops digital resources, mentors others",
    outstandingBehaviours: "Pioneers digital transformation, creates innovative solutions, leads technology adoption"
  }
];

async function importAcademicCompetencies() {
  try {
    console.log('🚀 Starting academic competencies import...');
    
    for (const competency of academicCompetenciesData) {
      await prisma.competency.create({
        data: {
          code: competency.name.toLowerCase().replace(/\s+/g, '_'),
          title: competency.name,
          cluster: 'CORE',
          department: competency.area,
          definition: competency.description,
          behaviorsBasic: competency.basicBehaviours,
          behaviorsAbove: competency.aboveBehaviours,
          behaviorsOutstanding: competency.outstandingBehaviours,
          active: true
        }
      });

      console.log(`✅ Added: ${competency.name} (${competency.area})`);
    }

    console.log('🎉 Academic competencies import completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importAcademicCompetencies();
