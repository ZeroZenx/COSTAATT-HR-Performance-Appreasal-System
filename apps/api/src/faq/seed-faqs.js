const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const faqs = [
  // Base Tier - All Users
  {
    question: "What is a performance appraisal?",
    answer: "A structured evaluation of an employee's job performance during a cycle, including objective achievements, competencies, and goals. Support your queries by referring to your template and competency library.",
    role: "ALL",
    category: "GENERAL"
  },
  {
    question: "Why must I complete a self-appraisal?",
    answer: "The self-appraisal allows you to reflect on your performance, set development goals, and provide context that may inform your manager's evaluation.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "When is the self-appraisal due?",
    answer: "The due date is configured per cycle and may be X days before the appraisal interview. You can view the due date in the 'My Self-Appraisal' section.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "Can I edit my self-appraisal after submitting?",
    answer: "Only if the supervisor or HR returns it 'for edits.' Once unlocked and returned, you can update until final submission. After finalization, it becomes read-only.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "What if I miss the self-appraisal deadline?",
    answer: "You'll receive reminders at intervals (e.g., 10, 5, 2 days before). If still not submitted, your manager or HR can unlock or finalize it with documentation.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "Who can see my self-appraisal responses?",
    answer: "Your supervisor and HR. Peers (if peer feedback is enabled) remain anonymous; they do not see your full responses.",
    role: "ALL",
    category: "GENERAL"
  },
  {
    question: "How are the performance scores calculated?",
    answer: "Each section (Functional, Core, Projects, Student Evaluations) has a divisor and weight. The system computes subtotals and sums them into a final weighted score, which maps into a band (Outstanding, Very Good, etc.).",
    role: "ALL",
    category: "SCORING"
  },
  {
    question: "When do I see the results or feedback?",
    answer: "After your manager completes the evaluation and HR finalizes it, your feedback and final score are released to you.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "Can I appeal or request changes to my evaluation?",
    answer: "Yes, via HR during the review period (before final locking). HR can rollback or correct with justification.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "How do signatures work?",
    answer: "Users capture signatures digitally (mouse/touch). Each signature time-stamps and locks that section (employee, supervisor, divisional head). HR's final sign-off locks the appraisal.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "What role does peer feedback play?",
    answer: "If enabled for your appraisal type, selected peers provide anonymous feedback mapped to core competencies. Your manager sees those comments as part of their review.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "Can I see my past appraisals?",
    answer: "Yes — in the 'My Appraisals' list you can review past cycles, feedback, and final scores.",
    role: "ALL",
    category: "GENERAL"
  },
  {
    question: "What if I change roles or supervisors mid-cycle?",
    answer: "The system will adjust scope mapping; HR may reassign or relink your appraisal instance to the new supervisor.",
    role: "ALL",
    category: "WORKFLOW"
  },
  {
    question: "How do I file a support ticket or ask HR a question?",
    answer: "Use the chatbot's 'Create HR Question' action or the 'Support / Contact HR' link under Settings.",
    role: "ALL",
    category: "TECHNICAL"
  },

  // Supervisor Role
  {
    question: "Can I create an appraisal for anyone?",
    answer: "No. You can only create appraisals for employees in your supervisory scope (direct + indirect reports).",
    role: "SUPERVISOR",
    category: "WORKFLOW"
  },
  {
    question: "What template should I use for each employee?",
    answer: "The system preselects based on employee category (Dean, Faculty, Clinical, General Staff, Executive). Confirm or override with care.",
    role: "SUPERVISOR",
    category: "TEMPLATES"
  },
  {
    question: "How do I include student evaluations or project weighting?",
    answer: "For Faculty or Clinical staff, you can toggle the 'Include Student Evaluations' or 'Enable Projects' option. If projects are enabled, the student evaluations weight shifts accordingly (e.g., 0.15 vs 0.20).",
    role: "SUPERVISOR",
    category: "TEMPLATES"
  },
  {
    question: "What if an employee hasn't submitted their self-appraisal yet?",
    answer: "You can view the status and send them reminders. If 'Self-Appraisal' is required, the system may block you from finalizing evaluation until it's submitted (unless HR override).",
    role: "SUPERVISOR",
    category: "WORKFLOW"
  },
  {
    question: "How do I return an evaluation for edits?",
    answer: "Use the 'Return for Edits' button, include feedback/reasons, and the employee can update and resubmit.",
    role: "SUPERVISOR",
    category: "WORKFLOW"
  },
  {
    question: "How do I ensure fairness and consistency in scoring?",
    answer: "Use the the Competency Library definitions as your baseline. During calibration, HR may adjust scores across managers.",
    role: "SUPERVISOR",
    category: "SCORING"
  },
  {
    question: "Can I view the peer feedback given to an employee?",
    answer: "Yes — you see peer feedback only in aggregate under each Core competency item (anonymous).",
    role: "SUPERVISOR",
    category: "WORKFLOW"
  },
  {
    question: "How do I recommend contract renewal or non-renewal?",
    answer: "At the Final Review stage, tick boxes (Confirm, Renew Contract, Do Not Renew, etc.), add your comments and sign.",
    role: "SUPERVISOR",
    category: "WORKFLOW"
  },
  {
    question: "What if my direct report joins mid-cycle?",
    answer: "HR can seed a new appraisal task for them. You must complete a partial evaluation if time-frame is shortened.",
    role: "SUPERVISOR",
    category: "WORKFLOW"
  },
  {
    question: "Can I override scoring or weights?",
    answer: "Only if HR has granted an override role. Otherwise, scoring logic is fixed to avoid bias.",
    role: "SUPERVISOR",
    category: "SCORING"
  },

  // HR / Admin
  {
    question: "How do I import employees & supervisors?",
    answer: "Use the 'Employee Import' in Settings. Upload a spreadsheet (e.g. XLSX/CSV) with columns such as Email, Job Title, Supervisor Email, etc. The system processes in chunks and flags errors.",
    role: "HR_ADMIN",
    category: "TECHNICAL"
  },
  {
    question: "What happens when the import fails or has errors?",
    answer: "You'll get a summary with error rows. Download the error CSV, fix data, and re-import only failed rows.",
    role: "HR_ADMIN",
    category: "TECHNICAL"
  },
  {
    question: "How do I manage appraisal templates?",
    answer: "In Settings → Templates, you can view templates, import the GS/Executive XLSX forms, adjust weights, set active versions, and version-control.",
    role: "HR_ADMIN",
    category: "TEMPLATES"
  },
  {
    question: "How do I close or reopen a cycle?",
    answer: "In Settings → Appraisal Cycles, you can mark a cycle as closed (prevent edits) or reopen it if corrections are needed.",
    role: "HR_ADMIN",
    category: "WORKFLOW"
  },
  {
    question: "Can I reassign supervisors or correct mapping?",
    answer: "Yes — using the Employee directory in Settings. Changing supervisor triggers recomputation of 'team scope.' You may need to rebuild the hierarchical scope.",
    role: "HR_ADMIN",
    category: "TECHNICAL"
  },
  {
    question: "How do I configure Office 365 SSO?",
    answer: "Input Tenant ID, Client IDs, Redirect URLs, App Role mapping, then test connection. Use the 'Test Connection' button to validate.",
    role: "HR_ADMIN",
    category: "TECHNICAL"
  },
  {
    question: "How do I adjust global weights or band thresholds?",
    answer: "Under Settings → System Configuration, you can edit default weights, band cutoffs, self-appraisal toggles, and global settings.",
    role: "HR_ADMIN",
    category: "SCORING"
  },
  {
    question: "How is audit tracking maintained?",
    answer: "Every admin action (import, config change, template edit, finalization) is logged in the Audit Logs with who/when/what.",
    role: "HR_ADMIN",
    category: "TECHNICAL"
  },
  {
    question: "How do I manage FAQ content for the chatbot?",
    answer: "In Settings → Help / FAQ, create, edit, version, and publish FAQ entries that the chatbot will surface.",
    role: "HR_ADMIN",
    category: "TECHNICAL"
  },
  {
    question: "How can I override or rollback a finalized appraisal?",
    answer: "HR can unlock or rollback a finalized appraisal (with justification), but note that this is audited and should be used sparingly.",
    role: "HR_ADMIN",
    category: "WORKFLOW"
  },
  {
    question: "Can the bot escalate a question automatically?",
    answer: "Yes — if the FAQ module doesn't find an answer, users can mark 'Ask HR' and the system will log an HR ticket.",
    role: "HR_ADMIN",
    category: "TECHNICAL"
  }
];

async function seedFAQs() {
  
  try {
    // Clear existing FAQs
    await prisma.fAQ.deleteMany();

    // Insert new FAQs
    for (const faq of faqs) {
      await prisma.fAQ.create({
        data: {
          ...faq,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFAQs();
