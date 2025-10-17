const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCompetencies() {
  try {
    console.log('🌱 Seeding competencies...');

    // Create competency clusters first
    const clusters = [
      { name: 'Personal Effectiveness and Leadership', description: 'Core leadership and personal effectiveness competencies', category: 'CORE' },
      { name: 'Values Focus', description: 'Values-based competencies', category: 'CORE' },
      { name: 'People Focus', description: 'People and relationship management competencies', category: 'CORE' },
      { name: 'AUDIT', description: 'Audit and compliance competencies', category: 'FUNCTIONAL' },
      { name: 'ACADEMICS', description: 'Academic and educational competencies', category: 'FUNCTIONAL' },
      { name: 'FINANCE', description: 'Financial management competencies', category: 'FUNCTIONAL' },
      { name: 'CORPORATE_SECRETARY', description: 'Corporate secretarial competencies', category: 'FUNCTIONAL' },
      { name: 'INFORMATION_TECHNOLOGY', description: 'IT and technology competencies', category: 'FUNCTIONAL' },
      { name: 'LIBRARY', description: 'Library and information services competencies', category: 'FUNCTIONAL' },
      { name: 'FACILITIES', description: 'Facilities management competencies', category: 'FUNCTIONAL' },
      { name: 'ADMINISTRATION', description: 'Administrative competencies', category: 'FUNCTIONAL' },
      { name: 'STUDENT_AFFAIRS', description: 'Student affairs competencies', category: 'FUNCTIONAL' },
      { name: 'MARKETING', description: 'Marketing and communications competencies', category: 'FUNCTIONAL' },
      { name: 'PROCUREMENT', description: 'Procurement and supply chain competencies', category: 'FUNCTIONAL' },
      { name: 'HUMAN_RESOURCES', description: 'Human resources competencies', category: 'FUNCTIONAL' },
      { name: 'PUBLIC_SAFETY_SECURITY', description: 'Public safety and security competencies', category: 'FUNCTIONAL' },
      { name: 'QUALITY_ASSURANCE', description: 'Quality assurance competencies', category: 'FUNCTIONAL' }
    ];

    for (const cluster of clusters) {
      await prisma.competencyCluster.upsert({
        where: { name: cluster.name },
        update: cluster,
        create: cluster
      });
    }

    // Get cluster IDs
    const coreCluster = await prisma.competencyCluster.findUnique({ where: { name: 'Personal Effectiveness and Leadership' } });
    const valuesCluster = await prisma.competencyCluster.findUnique({ where: { name: 'Values Focus' } });
    const peopleCluster = await prisma.competencyCluster.findUnique({ where: { name: 'People Focus' } });
    const adminCluster = await prisma.competencyCluster.findUnique({ where: { name: 'ADMINISTRATION' } });
    const academicCluster = await prisma.competencyCluster.findUnique({ where: { name: 'ACADEMICS' } });
    const itCluster = await prisma.competencyCluster.findUnique({ where: { name: 'INFORMATION_TECHNOLOGY' } });

    // Create competencies based on the Mac screenshots
    const competencies = [
      {
        code: 'COMM_SKILLS',
        name: 'Communication Skills',
        description: 'Communicates effectively with various stakeholders',
        definition: 'The ability to convey information clearly and effectively to different audiences',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Administration',
        jobLevel: 'All',
        category: 'CORE',
        clusterId: coreCluster.id
      },
      {
        code: 'COMMUNITY_SERVICE',
        name: 'Community Service',
        description: 'Contributes to community and institutional service',
        definition: 'Active participation in community and institutional service activities',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Academic Affairs',
        jobLevel: 'All',
        category: 'CORE',
        clusterId: academicCluster.id
      },
      {
        code: 'CURRICULUM_DEV',
        name: 'Curriculum Development',
        description: 'Develops and maintains relevant curriculum content',
        definition: 'Ability to create and update curriculum materials',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Academic Affairs',
        jobLevel: 'Faculty',
        category: 'FUNCTIONAL',
        clusterId: academicCluster.id
      },
      {
        code: 'DATA_ANALYSIS',
        name: 'Data Analysis',
        description: 'Analyzes data to inform decision-making',
        definition: 'Ability to collect, analyze, and interpret data for decision-making',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'IT Services',
        jobLevel: 'All',
        category: 'FUNCTIONAL',
        clusterId: itCluster.id
      },
      {
        code: 'INTERPERSONAL_SKILLS',
        name: 'Interpersonal Skills',
        description: 'Builds positive relationships and collaboration',
        definition: 'Ability to work effectively with others and build strong relationships',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Administration',
        jobLevel: 'All',
        category: 'CORE',
        clusterId: peopleCluster.id
      },
      {
        code: 'LEADERSHIP_MGMT',
        name: 'Leadership and Management',
        description: 'Demonstrates effective leadership and management skills',
        definition: 'Ability to lead teams and manage resources effectively',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Administration',
        jobLevel: 'Management',
        category: 'CORE',
        clusterId: coreCluster.id
      },
      {
        code: 'PROBLEM_SOLVING',
        name: 'Problem Solving',
        description: 'Identifies and resolves complex problems',
        definition: 'Ability to analyze problems and develop effective solutions',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Administration',
        jobLevel: 'All',
        category: 'CORE',
        clusterId: coreCluster.id
      },
      {
        code: 'PROF_DEVELOPMENT',
        name: 'Professional Development',
        description: 'Continuously develops professional skills and knowledge',
        definition: 'Commitment to ongoing learning and professional growth',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Academic Affairs',
        jobLevel: 'All',
        category: 'CORE',
        clusterId: academicCluster.id
      },
      {
        code: 'RESEARCH_SCHOLARSHIP',
        name: 'Research and Scholarship',
        description: 'Conducts meaningful research and contributes to academic knowledge',
        definition: 'Engagement in research activities and scholarly work',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Academic Affairs',
        jobLevel: 'Faculty',
        category: 'FUNCTIONAL',
        clusterId: academicCluster.id
      },
      {
        code: 'STRATEGIC_PLANNING',
        name: 'Strategic Planning',
        description: 'Contributes to organizational strategic planning',
        definition: 'Ability to contribute to long-term planning and strategy development',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Administration',
        jobLevel: 'Management',
        category: 'FUNCTIONAL',
        clusterId: adminCluster.id
      },
      {
        code: 'STUDENT_ASSESSMENT',
        name: 'Student Assessment',
        description: 'Develops fair and effective assessment methods',
        definition: 'Ability to create and implement effective student assessment strategies',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Academic Affairs',
        jobLevel: 'Faculty',
        category: 'FUNCTIONAL',
        clusterId: academicCluster.id
      },
      {
        code: 'TEACHING_EXCELLENCE',
        name: 'Teaching Excellence',
        description: 'Demonstrates effective teaching methods and student engagement',
        definition: 'Ability to deliver high-quality education and engage students effectively',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Academic Affairs',
        jobLevel: 'Faculty',
        category: 'FUNCTIONAL',
        clusterId: academicCluster.id
      },
      {
        code: 'TEAM_BUILDING',
        name: 'Team Building',
        description: 'Builds and maintains effective teams',
        definition: 'Ability to create and maintain high-performing teams',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'Administration',
        jobLevel: 'Management',
        category: 'CORE',
        clusterId: peopleCluster.id
      },
      {
        code: 'TECH_INTEGRATION',
        name: 'Technology Integration',
        description: 'Effectively integrates technology in work processes',
        definition: 'Ability to leverage technology to improve work processes and outcomes',
        basicBehaviours: 'Meets basic expectations in this area',
        aboveExpectationsBehaviours: 'Exceeds expectations and shows initiative',
        outstandingBehaviours: 'Demonstrates exceptional performance and leadership',
        department: 'IT Services',
        jobLevel: 'All',
        category: 'FUNCTIONAL',
        clusterId: itCluster.id
      }
    ];

    for (const competency of competencies) {
      await prisma.competency.upsert({
        where: { code: competency.code },
        update: competency,
        create: competency
      });
    }

    console.log('✅ Competencies seeded successfully!');
    console.log(`📊 Created ${competencies.length} competencies`);

  } catch (error) {
    console.error('❌ Error seeding competencies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompetencies();

