const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// COSTAATT Competency Framework
const competencies = [
  {
    code: 'TE001',
    title: 'Teaching Excellence',
    cluster: 'CORE',
    department: 'All',
    definition: 'Demonstrates mastery of pedagogical principles and effective teaching methodologies to facilitate student learning and academic success.',
    behaviorsBasic: 'Delivers clear, organized lectures and follows established teaching protocols. Uses standard assessment methods and provides timely feedback to students.',
    behaviorsAbove: 'Uses varied teaching methods and incorporates student feedback to improve delivery. Develops varied assessment strategies and uses data to inform teaching practices.',
    behaviorsOutstanding: 'Implements innovative teaching strategies and creates interactive learning environments. Creates innovative assessment tools and implements comprehensive evaluation systems.'
  },
  {
    code: 'RS001',
    title: 'Research and Scholarship',
    cluster: 'CORE',
    department: 'All',
    definition: 'Engages in scholarly activities, research, and knowledge creation that contributes to academic excellence and institutional reputation.',
    behaviorsBasic: 'Follows established research protocols and uses basic research methods. Presents research at local conferences and contributes to internal publications.',
    behaviorsAbove: 'Applies appropriate research methodologies and contributes to research projects. Publishes in peer-reviewed journals and presents at regional conferences.',
    behaviorsOutstanding: 'Designs and conducts independent research studies and publishes findings. Publishes in high-impact journals and presents at international conferences.'
  },
  {
    code: 'SD001',
    title: 'Student Development',
    cluster: 'CORE',
    department: 'All',
    definition: 'Supports student growth, development, and success through mentoring, advising, and creating supportive learning environments.',
    behaviorsBasic: 'Provides basic academic guidance and follows advising protocols. Maintains professional relationships with students and provides basic support.',
    behaviorsAbove: 'Develops personalized advising strategies and connects students with resources. Develops mentoring relationships and provides career guidance.',
    behaviorsOutstanding: 'Creates comprehensive advising programs and mentors student leaders. Creates mentoring programs and supports student leadership development.'
  },
  {
    code: 'PD001',
    title: 'Professional Development',
    cluster: 'CORE',
    department: 'All',
    definition: 'Engages in continuous learning and professional growth to enhance expertise and contribute to institutional excellence.',
    behaviorsBasic: 'Participates in required training and follows professional development protocols. Maintains professional relationships within the institution.',
    behaviorsAbove: 'Seeks out additional learning opportunities and applies new knowledge to practice. Builds external professional networks and participates in professional organizations.',
    behaviorsOutstanding: 'Pursues advanced certifications and shares knowledge with colleagues. Develops strategic professional partnerships and leads collaborative initiatives.'
  },
  {
    code: 'CE001',
    title: 'Community Engagement',
    cluster: 'CORE',
    department: 'All',
    definition: 'Contributes to the broader community through service, outreach, and knowledge transfer activities.',
    behaviorsBasic: 'Participates in community service activities and follows institutional guidelines. Participates in knowledge transfer activities and follows institutional protocols.',
    behaviorsAbove: 'Organizes community service initiatives and builds community partnerships. Develops knowledge transfer initiatives and builds community relationships.',
    behaviorsOutstanding: 'Develops community service programs and leads implementation. Creates comprehensive knowledge transfer programs and leads implementation.'
  },
  {
    code: 'AE001',
    title: 'Administrative Excellence',
    cluster: 'FUNCTIONAL',
    department: 'All',
    definition: 'Demonstrates effective administrative skills and contributes to institutional operations and governance.',
    behaviorsBasic: 'Follows project management protocols and completes assigned tasks. Manages assigned resources and follows institutional protocols.',
    behaviorsAbove: 'Manages small projects and coordinates with team members. Optimizes resource allocation and develops resource management strategies.',
    behaviorsOutstanding: 'Leads complex projects and develops project management strategies. Leads resource management initiatives and mentors others.'
  },
  {
    code: 'CL001',
    title: 'Communication and Leadership',
    cluster: 'FUNCTIONAL',
    department: 'All',
    definition: 'Demonstrates effective communication skills and leadership capabilities to inspire and guide others toward institutional goals.',
    behaviorsBasic: 'Communicates clearly and effectively in written and verbal formats. Participates in leadership development activities and follows institutional protocols.',
    behaviorsAbove: 'Adapts communication style to different audiences and situations. Takes on leadership roles in projects and contributes to institutional initiatives.',
    behaviorsOutstanding: 'Influences and inspires others through effective communication. Leads major institutional initiatives and mentors emerging leaders.'
  },
  {
    code: 'IT001',
    title: 'Innovation and Technology',
    cluster: 'FUNCTIONAL',
    department: 'All',
    definition: 'Embraces innovation and technology to enhance teaching, research, and administrative effectiveness.',
    behaviorsBasic: 'Uses basic technology tools and follows established protocols. Participates in technology training and applies new tools to work.',
    behaviorsAbove: 'Integrates technology effectively into teaching and administrative processes. Explores new technologies and shares knowledge with colleagues.',
    behaviorsOutstanding: 'Develops innovative technology solutions and leads technology initiatives. Establishes technology standards and contributes to institutional technology strategy.'
  },
  {
    code: 'EQ001',
    title: 'Ethics and Quality',
    cluster: 'CORE',
    department: 'All',
    definition: 'Maintains high ethical standards and commitment to quality in all professional activities.',
    behaviorsBasic: 'Follows ethical guidelines and institutional policies. Maintains professional standards and completes required quality assessments.',
    behaviorsAbove: 'Demonstrates ethical leadership and contributes to quality improvement initiatives. Uses data to inform practices and improve quality.',
    behaviorsOutstanding: 'Establishes ethical standards and leads quality assurance programs. Mentors others in ethical practices and contributes to institutional quality culture.'
  },
  {
    code: 'CD001',
    title: 'Cultural Diversity and Inclusion',
    cluster: 'CORE',
    department: 'All',
    definition: 'Promotes cultural diversity, inclusion, and equity in all aspects of institutional life.',
    behaviorsBasic: 'Respects cultural differences and follows inclusion guidelines. Participates in diversity training and awareness activities.',
    behaviorsAbove: 'Creates inclusive learning environments and promotes cultural understanding. Develops diversity initiatives and builds inclusive communities.',
    behaviorsOutstanding: 'Leads diversity and inclusion programs and mentors others in cultural competence. Establishes institutional diversity standards and contributes to national diversity initiatives.'
  }
];

async function seedCompetencies() {
  try {
    console.log('🌱 Seeding COSTAATT Competency Framework...');

    // Clear existing competencies
    await prisma.competencySelection.deleteMany();
    await prisma.competency.deleteMany();

    for (const competency of competencies) {
      console.log(`📚 Creating competency: ${competency.title}`);
      
      await prisma.competency.create({
        data: {
          code: competency.code,
          title: competency.title,
          cluster: competency.cluster,
          department: competency.department,
          definition: competency.definition,
          behaviorsBasic: competency.behaviorsBasic,
          behaviorsAbove: competency.behaviorsAbove,
          behaviorsOutstanding: competency.behaviorsOutstanding,
          active: true
        }
      });
    }

    console.log('✅ COSTAATT Competency Framework seeded successfully!');
    console.log(`📊 Created ${competencies.length} competencies`);

  } catch (error) {
    console.error('❌ Error seeding competencies:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedCompetencies();