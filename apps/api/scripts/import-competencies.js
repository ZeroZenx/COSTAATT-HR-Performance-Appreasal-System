const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample competency data matching the CORE COMPETENCIES structure
const competenciesData = [
  {
    name: "Communication Skills",
    area: "Professional Skills",
    description: "The ability to effectively convey information, ideas, and thoughts through various communication channels",
    basicBehaviours: "Responds to emails within 24 hours, participates in team meetings, uses appropriate language",
    aboveBehaviours: "Proactively shares information, facilitates group discussions, adapts communication style to audience",
    outstandingBehaviours: "Mentors others in communication, leads organization-wide initiatives, recognized as communication expert"
  },
  {
    name: "Leadership",
    area: "Management Skills",
    description: "The ability to guide, motivate, and influence others to achieve organizational goals",
    basicBehaviours: "Provides clear direction, supports team members, follows through on commitments",
    aboveBehaviours: "Inspires others to excel, develops team capabilities, makes difficult decisions",
    outstandingBehaviours: "Transforms organizational culture, develops future leaders, achieves exceptional results"
  },
  {
    name: "Problem Solving",
    area: "Analytical Skills",
    description: "The ability to identify, analyze, and resolve complex issues effectively",
    basicBehaviours: "Identifies problems clearly, gathers relevant information, proposes solutions",
    aboveBehaviours: "Thinks creatively, considers multiple perspectives, implements effective solutions",
    outstandingBehaviours: "Anticipates potential issues, develops innovative approaches, mentors others in problem-solving"
  },
  {
    name: "Technical Expertise",
    area: "Professional Skills",
    description: "Demonstrates proficiency in job-specific technical knowledge and skills",
    basicBehaviours: "Performs tasks competently, follows established procedures, maintains current knowledge",
    aboveBehaviours: "Applies advanced techniques, troubleshoots complex issues, shares knowledge with others",
    outstandingBehaviours: "Develops new methodologies, recognized as subject matter expert, drives innovation"
  },
  {
    name: "Teamwork",
    area: "Interpersonal Skills",
    description: "The ability to work collaboratively with others to achieve common goals",
    basicBehaviours: "Participates actively in team activities, shares information, supports team decisions",
    aboveBehaviours: "Facilitates team collaboration, resolves conflicts constructively, builds team cohesion",
    outstandingBehaviours: "Creates high-performing teams, develops team culture, achieves exceptional team results"
  },
  {
    name: "Adaptability",
    area: "Personal Skills",
    description: "The ability to adjust to changing circumstances and embrace new challenges",
    basicBehaviours: "Accepts change with minimal resistance, learns new skills as required, maintains performance",
    aboveBehaviours: "Embraces change opportunities, quickly adapts to new situations, helps others adapt",
    outstandingBehaviours: "Drives organizational change, develops change management capabilities, leads transformation"
  },
  {
    name: "Customer Focus",
    area: "Service Skills",
    description: "The ability to understand and meet customer needs effectively",
    basicBehaviours: "Responds to customer inquiries, follows service standards, maintains professional demeanor",
    aboveBehaviours: "Anticipates customer needs, provides exceptional service, builds customer relationships",
    outstandingBehaviours: "Develops customer-centric culture, creates service innovations, achieves customer loyalty"
  },
  {
    name: "Innovation",
    area: "Creative Skills",
    description: "The ability to generate new ideas and implement creative solutions",
    basicBehaviours: "Suggests improvements, participates in brainstorming, implements new ideas",
    aboveBehaviours: "Develops innovative solutions, challenges conventional thinking, leads creative initiatives",
    outstandingBehaviours: "Transforms organizational practices, creates breakthrough innovations, inspires others to innovate"
  }
];

async function importCompetencies() {
  try {
    console.log('🚀 Starting competencies import...');
    
    for (const competency of competenciesData) {
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

    console.log('🎉 Competencies import completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importCompetencies();
