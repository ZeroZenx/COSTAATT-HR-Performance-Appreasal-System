const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCompetencyFramework() {
  console.log('🌱 Seeding COSTAATT Competency Framework...');

  try {
    // Create Core Competency Clusters
    const coreClusters = [
      {
        name: 'Personal Effectiveness and Leadership',
        description: 'Competencies that emphasize the development of personal leadership and effectiveness',
        category: 'CORE'
      },
      {
        name: 'Values Focus',
        description: 'Competencies that provide the basis for shared understanding of COSTAATT\'s values',
        category: 'CORE'
      },
      {
        name: 'People Focus',
        description: 'Competencies that highlight skills and behaviours necessary to develop, retain, and motivate high calibre staff',
        category: 'CORE'
      }
    ];

    const createdCoreClusters = [];
    for (const cluster of coreClusters) {
      const created = await prisma.competencyCluster.upsert({
        where: { name: cluster.name },
        update: cluster,
        create: cluster
      });
      createdCoreClusters.push(created);
    }

    // Create Functional Competency Clusters
    const functionalClusters = [
      { name: 'AUDIT', description: 'Internal Audit Competencies', category: 'FUNCTIONAL' },
      { name: 'ACADEMICS', description: 'Academic Competencies', category: 'FUNCTIONAL' },
      { name: 'FINANCE', description: 'Finance Competencies', category: 'FUNCTIONAL' },
      { name: 'CORPORATE_SECRETARY', description: 'Corporate Secretary Competencies', category: 'FUNCTIONAL' },
      { name: 'INFORMATION_TECHNOLOGY', description: 'IT Competencies', category: 'FUNCTIONAL' },
      { name: 'LIBRARY', description: 'Library Competencies', category: 'FUNCTIONAL' },
      { name: 'FACILITIES', description: 'Facilities Management Competencies', category: 'FUNCTIONAL' },
      { name: 'ADMINISTRATION', description: 'Administrative Competencies', category: 'FUNCTIONAL' },
      { name: 'STUDENT_AFFAIRS', description: 'Student Affairs Competencies', category: 'FUNCTIONAL' },
      { name: 'MARKETING', description: 'Marketing Competencies', category: 'FUNCTIONAL' },
      { name: 'PROCUREMENT', description: 'Procurement Competencies', category: 'FUNCTIONAL' },
      { name: 'HUMAN_RESOURCES', description: 'Human Resources Competencies', category: 'FUNCTIONAL' },
      { name: 'PUBLIC_SAFETY_SECURITY', description: 'Public Safety and Security Competencies', category: 'FUNCTIONAL' },
      { name: 'QUALITY_ASSURANCE', description: 'Quality Assurance Competencies', category: 'FUNCTIONAL' }
    ];

    const createdFunctionalClusters = [];
    for (const cluster of functionalClusters) {
      const created = await prisma.competencyCluster.upsert({
        where: { name: cluster.name },
        update: cluster,
        create: cluster
      });
      createdFunctionalClusters.push(created);
    }

    // Core Competencies - Personal Effectiveness and Leadership
    const personalEffectivenessCluster = createdCoreClusters.find(c => c.name === 'Personal Effectiveness and Leadership');
    
    const personalEffectivenessCompetencies = [
      {
        code: 'COMM_SKILLS',
        name: 'Communication Skills',
        description: 'Shares all relevant information with, and receives information from, constituencies using oral, and interpersonal communication methods',
        definition: 'Shares all relevant information with, and receives information from, constituencies using oral, and interpersonal communication methods',
        basicBehaviours: '• generally orally shares relevant information with appropriate constituencies in a timely and effective manner;\n• consistently responds appropriately to oral directives, instructions and information;\n• listens to others with the intent to understand.',
        aboveExpectationsBehaviours: '• consistently shares relevant information with appropriate constituencies in a timely and effective manner\n• builds effective formal and informal oral communication channels;\n• checks for understanding of the communication by asking open-ended questions that draw out the listener\'s understanding.',
        outstandingBehaviours: '• consistently shares relevant information with appropriate constituencies in a timely and effective manner\n• models interpersonal communication that invites participation and future dialogue;\n• clearly conveys and receives information and ideas through a variety of media to individuals or groups in a manner that engages the listener,\n• helps audience (learners) understand and retain the message, and invites response and feedback.',
        clusterId: personalEffectivenessCluster.id,
        category: 'CORE'
      },
      {
        code: 'INTERPERSONAL_SKILLS',
        name: 'Interpersonal Skills',
        description: 'Interacts and effectively communicates with a variety of individuals in an organizational environment in a respectful and professional manner',
        definition: 'Interacts and effectively communicates with a variety of individuals in an organizational environment in a respectful and professional manner',
        basicBehaviours: '• consistently cooperative, considerate and tactful in dealing with students, co-workers and the public.',
        aboveExpectationsBehaviours: '• maintains composure during stressful or difficult situations; generally conveys respect for others.',
        outstandingBehaviours: '• facilitates dialogue to gain agreement using sound rationale to explain value of actions; consistently conveys respect for others.',
        clusterId: personalEffectivenessCluster.id,
        category: 'CORE'
      },
      {
        code: 'PLANNING_ORGANIZING',
        name: 'Planning and Organising',
        description: 'Establishes an efficient course of action to ensure accomplishment of specific objectives and work plans',
        definition: 'Establishes an efficient course of action to ensure accomplishment of specific objectives and work plans. It involves being able to set time-lines, by judging the level of difficulty of tasks and projects.',
        basicBehaviours: '• Monitors allocation of resources, anticipating changing requirements that may impact work delivery.\n• Ensures evaluation processes are in place to measure project benefits.\n• Gains buy-in and commitment to project delivery from diverse stakeholders.',
        aboveExpectationsBehaviours: '• Prioritises work in line with key team or project deliverables.\n• Makes contingency plans to account for changing work priorities, deadlines and milestones.\n• Identifies and consults with sponsors or stakeholders in planning work.\n• Pays close attention to detail, ensuring team\'s work is delivered to a high standard.\n• Negotiates realistic timescales for work delivery, ensuring team deliverables can be met',
        outstandingBehaviours: '• Takes accountability for monitoring delivery of the College\'s commitments.\n• Uses quality assurance processes across the organisation as a feedback mechanism to improve performance.\n• Takes responsibility for ensuring tools and techniques are available for the effective management of programmes\n• Realigns COSTAATT objectives to respond to changing external & internal agendas.',
        clusterId: personalEffectivenessCluster.id,
        category: 'CORE'
      },
      {
        code: 'PROBLEM_SOLVING',
        name: 'Problem Solving',
        description: 'Anticipates and identifies problem; involves others in seeking innovative simple solutions',
        definition: 'Anticipates and identifies problem; involves others in seeking innovative simple solutions; conducts appropriate analyses; searches for best solutions that accrue benefits and minimizes costs, within and/ or outside the classroom; responds quickly to new challenges takes thoughtful risks that are well balanced.',
        basicBehaviours: '• generally anticipates problems and may attempt solutions;\n• involves others in seeking innovative simple solutions;\n• conducts appropriate analyses;\n• searches for best solutions that accrue benefits and minimizes costs, within and/ or outside the classroom;\n• responds quickly to new challenges and generally takes balanced risks\n• generally applies appropriate level of analysis to problems.',
        aboveExpectationsBehaviours: '• anticipates, specifically identifies and attempts to address problems;\n• involves others in seeking innovative simple solutions;\n• conducts appropriate analyses;\n• searches for best solutions that accrue benefits and minimizes costs, within and/ or outside the classroom;\n• responds quickly to new challenges and takes thoughtful, well balanced risks;\n• proactively implements fixes and changes as needed to keep small problems from becoming big problems.',
        outstandingBehaviours: '• anticipates, specifically identifies and addresses a ranges of problems;\n• involves others in seeking innovative solutions;\n• conducts appropriate analyses;\n• searches for best solutions that accrue benefits and minimizes costs, within and/ or outside the classroom;\n• responds quickly to new challenges and takes thoughtful and very well balanced risks;\n• proactively anticipates and addresses concerns of students, peers, upper management, and general public.',
        clusterId: personalEffectivenessCluster.id,
        category: 'CORE'
      },
      {
        code: 'TECHNICAL_PROFICIENCY',
        name: 'Technical Proficiency',
        description: 'Applies technical knowledge and skills of the required specialist and professional job role and responsibilities',
        definition: 'Applies technical knowledge and skills of the required specialist and professional job role and responsibilities in order to achieve expected outcomes.',
        basicBehaviours: '• generally demonstrates technical proficiency in areas of work-unit\'s responsibility;\n• applies technical knowledge and skills of the required specialist and professional job role and responsibilities in order to achieve expected outcomes.',
        aboveExpectationsBehaviours: '• demonstrates understanding of the technical difficulty and complexity of work undertaken and advises others accordingly;\n• applies technical knowledge and skills of the required specialist and professional job role and responsibilities in order to achieve expected outcomes.',
        outstandingBehaviours: '• accounts for the technical difficulty and complexity of own work and that of staff, where appropriate, at key milestones;\n• applies technical knowledge and skills of the required specialist and professional job role and responsibilities in order to achieve expected outcomes.',
        clusterId: personalEffectivenessCluster.id,
        category: 'CORE'
      },
      {
        code: 'DECISION_MAKING',
        name: 'Decision Making',
        description: 'Makes clear, transparent decisions based on available evidence',
        definition: 'Makes clear, transparent decisions based on available evidence; acts with integrity in all decision making; distinguishes relevant from irrelevant information and makes timely decisions; considers impact on College community.',
        basicBehaviours: '• generally follows appropriate methods and strategies in making decisions;\n• makes the right decision in most instances.',
        aboveExpectationsBehaviours: '• determines or develops appropriate and relevant criteria for effective decision making;\n• consistently makes correct decisions in a variety of circumstances.',
        outstandingBehaviours: '• strikes a balance between being participative, i.e., involving team members in decisions and being directive, depending on the needs of the team and the situation.\n• consistently makes correct decisions in a variety of circumstances.',
        clusterId: personalEffectivenessCluster.id,
        category: 'CORE'
      },
      {
        code: 'LEADERSHIP',
        name: 'Leadership',
        description: 'Strategic Thinking - using an understanding of the bigger picture to uncover potential challenges and opportunities',
        definition: 'Strategic Thinking is using an understanding of the bigger picture to uncover potential challenges and opportunities for the long term and turning these into a compelling vision for action',
        basicBehaviours: '• Translates COSTAATT vision and strategy into practical and tangible plans for own team or delivery partner.\n• Consistently takes account of the wider implications of team\'s actions.\n• Encourages self and others to think about organisation\'s long term potential.\n• Informs strategy development by identifying gaps in current delivery or evidence.\n• Takes account of a wide range of public and partner needs to inform team\'s work',
        aboveExpectationsBehaviours: '• Works with a view to the future, prioritising own and others\' work in line with COSTAATT objectives.\n• Briefs and prepares team to accomplish goals and objectives.\n• Communicates the strategic priorities in a compelling and convincing manner, encouraging buy-in.\n• Identifies synergies between team priorities and other relevant agendas.\n• Develops own and team plans that do not reflect the strategic vision of the College.',
        outstandingBehaviours: '• Translates an understanding of the complex and diverse threats and issues facing the College into positive action.\n• Proactively involves partners in strategic thinking, incorporating their views into plans and working with them to align strategic priorities.\n• Sets organisational priorities by identifying where time and investment is needed most.\n• Generates and leads strategic initiatives that reflect the College\'s position as a educational authority.',
        clusterId: personalEffectivenessCluster.id,
        category: 'CORE'
      },
      {
        code: 'MANAGING_CHANGE',
        name: 'Managing Change',
        description: 'Inspires and lead individuals and groups of employees toward the need for change',
        definition: 'Inspires and lead individuals and groups of employees toward the need for change and clearly communicates the direction and challenges for change',
        basicBehaviours: '• Identifies strategic change initiatives and champions their implementation and delivery.\n• Articulates a clear, compelling vision for change and communicates benefits and reasons across the organisation\n• Anticipates underlying resistance to change and implements approaches to address these issues.\n• Takes appropriate risks in pursuit of improvements and supports others in doing so.\n• Builds on healthy debate as a tool for driving through organizational improvement and advancement.',
        aboveExpectationsBehaviours: '• Develops contingency plans for major resistance and/or unpredicted issues in implementing change.\n• Facilitates & leads strategic change and complex reorganization within the College creates an environment where people understand the need to change; feel inspired & empowered to develop and deploy their ideas.\n• Creates a climate for continuous improvement, role models new ways of working and new ways of thinking; retains respect for traditional values.\n• Uses tools and techniques to stimulate others creativity',
        outstandingBehaviours: '• Anticipating and responding to change is superior.\n• Constantly creates a climate for continuous improvement, role models new ways of working and new ways of thinking; retains respect for traditional values.\n• Consistently uses tools and techniques to stimulate others creativity.\n• Benchmarks within and without the organisation and industry to stimulate ideas for change.\n• Supports the change process by encouraging others to take ownership of driving it forward.\n• Translates organizational change strategies into specific and practical goals, processes, and time frames.\n• Communicates realities and reasons for change and develops strategies for managing it.',
        clusterId: personalEffectivenessCluster.id,
        category: 'CORE'
      }
    ];

    // Create Personal Effectiveness Competencies
    for (const competency of personalEffectivenessCompetencies) {
      await prisma.competency.upsert({
        where: { code: competency.code },
        update: competency,
        create: competency
      });
    }

    // Values Focus Competencies
    const valuesFocusCluster = createdCoreClusters.find(c => c.name === 'Values Focus');
    
    const valuesFocusCompetencies = [
      {
        code: 'STEWARDSHIP',
        name: 'Stewardship',
        description: 'Demonstrates integrity, accountability and efficient stewardship of the College\'s resources',
        definition: 'Demonstrates integrity, accountability and efficient stewardship of the College\'s resources in a manner which is consistent with College policy.',
        basicBehaviours: '• shows consistent integrity and accountability with regard to the College\'s resources;\n• adheres to the College\' policies and guidelines with respect to the College\'s resources..',
        aboveExpectationsBehaviours: '• shows consistent integrity and accountability with regard to the College\'s resources;\n• adheres to the College\' policies and guidelines with respect to the College\'s resources..\n• assures effective management of the College\'s resources.',
        outstandingBehaviours: '• shows consistent integrity and accountability with regard to the College\'s resources;\n• adheres to the College\' policies and guidelines with respect to the College\'s resources;\n• engages strategies to enhance/improve the College\'s resources.',
        clusterId: valuesFocusCluster.id,
        category: 'CORE'
      },
      {
        code: 'ACHIEVEMENT_FOCUS',
        name: 'Achievement Focus',
        description: 'Assumes responsibility for one\'s performance and the correctness of one\'s interventions',
        definition: 'Assumes responsibility for one\'s performance and the correctness of one\'s interventions; recognizes opportunities and acts efficiently at the appropriate moment and within the given deadlines',
        basicBehaviours: '• assumes responsibility for one\'s performance and the correctness of one\'s interventions;\n• recognizes opportunities and acts efficiently at the appropriate moment and within the given deadlines.',
        aboveExpectationsBehaviours: '• assumes responsibility for one\'s performance and the correctness of one\'s interventions;\n• recognizes opportunities and acts efficiently at the appropriate moment and within the given deadlines;\n• attains most goals and targets.',
        outstandingBehaviours: '• assumes responsibility for one\'s performance and the correctness of one\'s interventions;\n• recognizes opportunities and acts efficiently at the appropriate moment and within the given deadlines.\n• consistently attains goals and targets.',
        clusterId: valuesFocusCluster.id,
        category: 'CORE'
      },
      {
        code: 'SERVICE_TO_COLLEGE',
        name: 'Service to the College and Community',
        description: 'Contributes to the image and or development of the College by engaging in activities that enhance the College\'s standing',
        definition: 'Contributes to the image and or development of the College by engaging in activities that enhance the College\'s standing and role in the community including attracting resources, provision of specialized courses, revenue–generating activities; participating in college committees beyond departmental requirements.',
        basicBehaviours: '• functions on at least ONE committee, outside of departmental committees, that is involved in development and or quality improvement of operations in the College;\n• assists in generating revenue for department/College.',
        aboveExpectationsBehaviours: '• functions on at least ONE committee outside of departmental committees, that is involved in development and or quality improvement of operations in the College;\n• shares expertise with colleagues to further the college\'s goals; represents the College on external/ national committees that help to raise the profile of the College;\n• assists in generating revenue for department/ College.',
        outstandingBehaviours: '• functions on more than ONE committee, outside of departmental committees, that are involved in development and or quality improvement of operations in the College;\n• represents the College on external/ national committees that help to raise the profile of the College;\n• shares expertise with colleagues to further the college\'s goals;\n• assists in generating revenue for the College/ department;\n• engages in impactful performance that raises the profile of the College.',
        clusterId: valuesFocusCluster.id,
        category: 'CORE'
      },
      {
        code: 'SERVICE_FOCUS',
        name: 'Service Focus',
        description: 'Values the importance of delivering high quality, innovative service to internal and external clients',
        definition: 'Values the importance of delivering high quality, innovative service to internal and external clients, demonstrates understanding of the needs of students and staff, responds promptly to, and is accessible to them; maintains positive, long-term working relationships with peers; assumes ownership of applicable process issues and takes appropriate steps to mitigate problems.',
        basicBehaviours: '• overtly and consciously demonstrates ability to provide quality service to students and staff.\n• demonstrates understanding of the needs of students and staff, responds promptly to, and is accessible to them; maintains positive, long-term working relationships with peers;\n• assumes ownership of applicable process issues and takes appropriate steps to mitigate problems.',
        aboveExpectationsBehaviours: '• continually takes steps to provide high quality service to students and staff;\n• demonstrates understanding of the needs of students and staff, responds promptly to, and is accessible to them; maintains positive, long-term working relationships with peers;\n• assumes ownership of applicable process issues and takes appropriate steps to mitigate problems.',
        outstandingBehaviours: '• consciously focuses on providing high quality service to students and staff;\n• takes appropriate and relevant steps in that regard; gains and retains trust and respect of students and staff;\n• demonstrates understanding of the needs of students and staff, responds promptly to, and is accessible to them; maintains positive, long-term working relationships with peers;\n• assumes ownership of applicable process issues and takes appropriate steps to mitigate problems.',
        clusterId: valuesFocusCluster.id,
        category: 'CORE'
      },
      {
        code: 'RESULTS_ORIENTATION',
        name: 'Results orientation/Commitment to excellence',
        description: 'Driving to achieve results while pursuing the highest standards',
        definition: 'Driving to achieve results while pursuing the highest standards. Maximizing the use of resources. Moving from basic results orientation to managing for results, to linking results',
        basicBehaviours: '• Linking results to strategic goals\n• Agrees on work plan outputs with staff, ensures they are aware of performance standards and measures attainment of results.\n• Ensures that work methods and processes are effective/efficient and appropriate for the achievement of desired results and standards of excellence.\n• Foresees potential obstacles, develops contingency plans and redirects staff activities to ensure timely completion of the unit\'s outputs.\n• Seeks ways to maximize the efficient use of resources and makes adjustments as required',
        aboveExpectationsBehaviours: '• Moves multiple project and programs forward by clarifying objectives and providing feedback.\n• Focuses action and resources on the achievement of strategic goals and priorities.\n• Sets challenging outputs for the office/unit in line with COSTAATT\'s strategic and organizational priorities and gets resources and support needed by the team to achieve results',
        outstandingBehaviours: '• Sets and communicates standards for organizational performance in area of responsibility and sustains COSTAATT\'s momentum towards accomplishing results.\n• Establishes and maintains effective accountability systems which measure activities and results against outcomes/outputs and indicators.\n• Provides organizational leadership in setting and applying standards of excellence.\n• Promotes dialogue about excellence at all levels of the organization, encouraging staff to strive for excellence in all aspects of their work.',
        clusterId: valuesFocusCluster.id,
        category: 'CORE'
      }
    ];

    // Create Values Focus Competencies
    for (const competency of valuesFocusCompetencies) {
      await prisma.competency.upsert({
        where: { code: competency.code },
        update: competency,
        create: competency
      });
    }

    // People Focus Competencies
    const peopleFocusCluster = createdCoreClusters.find(c => c.name === 'People Focus');
    
    const peopleFocusCompetencies = [
      {
        code: 'PERFORMANCE_MANAGEMENT',
        name: 'Performance Management',
        description: 'Accepting responsibility for personal performance and performance of staff',
        definition: 'Accepting responsibility for personal performance and performance of staff. Managing own career development to enhance value to COSTAATT and its staff. Managing the performance of staff, including fair evaluation of performance. Creating the conditions for outstanding performance.',
        basicBehaviours: '• Conducts group and individual work planning, including setting outputs, clarifying roles, responsibilities and competency expectations.\n• Recognizes and expresses appreciation for good performance and addresses poor performance and inappropriate work ethics and practices in a prompt, fair and consistent manner\n• Provides effective, continuous feedback and coaching to staff with the aim of guiding them to improve their performance and develop their competencies\n• Evaluates staff performance fairly, conducting mid-year and end-year performance evaluations in a timely and constructive manner',
        aboveExpectationsBehaviours: '• Creates opportunities for staff to grow and develop their knowledge and competencies in order to attain excellent standards of performance\n• Manages talent such that staff who do not have the required competencies are encouraged either to develop them or to seek employment opportunities which better match their strengths and abilities\n• Actively promotes and acts in accordance with the College\'s Performance Appraisal and Development system, gaining commitment from staff to achieving set outputs and performance standards.\n• Holds supervisors accountable for fair and accurate performance evaluations and for addressing performance issues as they arise, including violations of the code of conduct.',
        outstandingBehaviours: '• Champions the practice of continuous learning organization-wide, encouraging staff to devote appropriate time to their development and career management.\n• Creates and supports a policy environment that attracts, develops, and retains the best available talent at all levels, ensuring the development of future leaders.\n• Creates a culture of accountability for performance ensuring consistency, fairness and transparency of performance appraisals and holding managers. accountable for achieving outputs and maintaining performance standards\n• Translates organizational strategies into staffing requirements, building necessary talent-base to ensure long term success for the College.',
        clusterId: peopleFocusCluster.id,
        category: 'CORE'
      },
      {
        code: 'SELF_MANAGEMENT',
        name: 'Self management/Emotional intelligence',
        description: 'Managing moods, responding effectively to stress, situations of ambiguity or crisis',
        definition: 'Managing moods, responding effectively to stress, situations of ambiguity or crisis. Managing relationships with others to achieve mutual benefit. Building an emotionally intelligent organization.',
        basicBehaviours: '• Stays calm and maintains composure under stress or during a crisis keeping disruptive emotions under control.\n• Adapts flexibly to changing situations, overcomes obstacles and recovers quickly from set-backs\n• Tolerates conditions of stress, uncertainty or ambiguity and continues to maintain a positive outlook and to work productively.\n• Is realistic about own limits using support mechanisms as needed and maintaining an appropriate work-life balance\n• Senses the emotions of others, understanding their perspective, taking an active interest in their concerns.',
        aboveExpectationsBehaviours: '• Fosters a positive outlook and maintains focus during period of stress and heavy work load, inspiring and guiding others towards goal achievement.\n• Creates a climate of enthusiasm and flexibility, where people feel encouraged to give their best.\n• Stands up to group pressure, not giving in out of a desire to please or to avoid confrontation and conflict',
        outstandingBehaviours: '• Creates a work environment which minimizes stress and ensures an even distribution of work load.\n• Demonstrates a genuine passion for the work, and leverages political forces and tacit knowledge to support the achievement of organizational goals and priorities.\n• Foresees how others will interpret and react to events, using that awareness to smooth the way.\n• Supports the right of staff to a personal life and a reasonable balance between work and personal life',
        clusterId: peopleFocusCluster.id,
        category: 'CORE'
      },
      {
        code: 'TEAMWORK',
        name: 'Teamwork',
        description: 'Cooperates and collaborates with colleagues as appropriate',
        definition: 'Cooperates and collaborates with colleagues as appropriate; works in partnership with others; builds and maintains good relationships with peers, other staff and students; delivers on commitments to team/College.',
        basicBehaviours: '• cooperates and collaborates with colleagues as appropriate;\n• works in partnership with others; builds and maintains good relationships with peers, other staff and students;\n• delivers on commitments to team/College',
        aboveExpectationsBehaviours: '• cooperates and collaborates with colleagues as appropriate;\n• works in partnership with others; builds and maintains good relationships with peers, other staff and students;\n• delivers on commitments to team/College\n• builds and maintains effective working relationships with peers and campus partners.',
        outstandingBehaviours: '• cooperates and collaborates with colleagues as appropriate;\n• works in partnership with others; builds and maintains good relationships with peers, other staff and students;\n• delivers on commitments to team/College\n• actively works to remove barriers to team effectiveness;\n• motivates peers and colleagues to achieve goals and targets.',
        clusterId: peopleFocusCluster.id,
        category: 'CORE'
      }
    ];

    // Create People Focus Competencies
    for (const competency of peopleFocusCompetencies) {
      await prisma.competency.upsert({
        where: { code: competency.code },
        update: competency,
        create: competency
      });
    }

    // Add some functional competencies for key departments
    const academicsCluster = createdFunctionalClusters.find(c => c.name === 'ACADEMICS');
    
    const academicsCompetencies = [
      {
        code: 'EXEMPLARY_BEHAVIOURS',
        name: 'Exemplary Behaviours',
        description: 'Demonstrates exemplary professional and upstanding behaviours',
        definition: 'Demonstrates exemplary professional and upstanding behaviours – moral, ethical, professional including objectivity, honesty and accessibility to students.',
        basicBehaviours: 'consistently demonstrates exemplary and upstanding behaviours that undergird professionalism;\n• mainly treats objectively and in a non-discriminatory manner with students;\n• usually makes self available to students as necessary.',
        aboveExpectationsBehaviours: '• consistently demonstrates exemplary and upstanding behaviours that undergird professionalism;\n• always treats objectively and in a non-discriminatory manner with students;\n• makes self available to students as necessary.',
        outstandingBehaviours: '• consistently demonstrates exemplary and upstanding behaviours that undergird professionalism;\n• always treats objectively and in a non-discriminatory manner with students;\n• always makes self available to students extending self beyond expectations.',
        clusterId: academicsCluster.id,
        category: 'FUNCTIONAL',
        department: 'ACADEMICS'
      },
      {
        code: 'KNOWLEDGE_DISCIPLINE',
        name: 'Knowledge of Discipline',
        description: 'Demonstrates comprehensive and up-to-date knowledge of the subject matter/discipline',
        definition: 'Demonstrates comprehensive and up-to-date knowledge of the subject matter/discipline in which he/she teaches; engages in activities to update disciplinary knowledge.',
        basicBehaviours: '• discusses/describes content that clearly relates to outcomes;\n• underscores currency of content material and strategises to keep current in the discipline;\n• manages/adjusts content to be relevant to level at which material is taught;\n• generally offers explanations of content.',
        aboveExpectationsBehaviours: '• discusses/describes content that clearly relate to outcomes;\n• underscores currency of content material and strategise to keep current in the discipline;\n• manages/adjusts content to be relevant to level at which material taught;\n• respectfully offers full and clear explanations, especially of challenging content.',
        outstandingBehaviours: '• discusses/describes content that clearly relate to outcomes;\n• ensures currency of content material and keeps current in the discipline;\n• manages/adjusts content to be relevant to level at which material is taught;\n• respectfully offers full and clear explanations of all content or how content may be integrated.',
        clusterId: academicsCluster.id,
        category: 'FUNCTIONAL',
        department: 'ACADEMICS'
      }
    ];

    // Create Academic Competencies
    for (const competency of academicsCompetencies) {
      await prisma.competency.upsert({
        where: { code: competency.code },
        update: competency,
        create: competency
      });
    }

    console.log('✅ Competency Framework seeded successfully!');
    console.log(`📊 Created ${createdCoreClusters.length} core competency clusters`);
    console.log(`📊 Created ${createdFunctionalClusters.length} functional competency clusters`);
    console.log(`📊 Created ${personalEffectivenessCompetencies.length + valuesFocusCompetencies.length + peopleFocusCompetencies.length + academicsCompetencies.length} competencies`);

  } catch (error) {
    console.error('❌ Error seeding competency framework:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedCompetencyFramework()
    .then(() => {
      console.log('🎉 Competency framework seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedCompetencyFramework };
