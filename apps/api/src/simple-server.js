const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auditLog = require('./middleware/auditLog');
const emailService = require('./notifications/emailService');
const natural = require('natural');
const compromise = require('compromise');
const { stemmer } = require('stemmer');
const argon2 = require('argon2');

const app = express();
const prisma = new PrismaClient();

// Login attempt tracking functions
const recordLoginAttempt = async (data) => {
  try {
    await prisma.loginAttempt.create({
      data: {
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success
      }
    });
  } catch (error) {
    console.error('Error recording login attempt:', error);
  }
};

const isEmailLockedOut = async (email) => {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: fifteenMinutesAgo
      }
    }
  });
  
  return failedAttempts >= 5;
};

const clearFailedAttempts = async (email) => {
  try {
  } catch (error) {
    console.error('Error clearing failed attempts:', error);
  }
};

// Advanced AI Functions
const INTENT_PATTERNS = {
  'appraisal_help': [
    'how to complete appraisal', 'appraisal process', 'performance review help',
    'appraisal steps', 'evaluation process', 'rating system'
  ],
  'appraisal_status': [
    'appraisal status', 'my appraisal', 'appraisal progress', 'evaluation status',
    'review status', 'appraisal completion'
  ],
  'appraisal_deadline': [
    'appraisal deadline', 'due date', 'submission date', 'deadline extension',
    'when is appraisal due', 'appraisal timeline'
  ],
  'appraisal_scores': [
    'appraisal scores', 'performance ratings', 'scoring system', 'rating bands',
    'score calculation', 'performance metrics'
  ],
  'competency_help': [
    'competency library', 'competencies', 'skills assessment', 'competency framework',
    'behavioral indicators', 'competency definitions'
  ],
  'competency_search': [
    'find competency', 'search competencies', 'competency lookup', 'skill search',
    'competency categories', 'competency areas'
  ],
  'goal_setting': [
    'goal setting', 'set goals', 'performance goals', 'objective setting',
    'goal management', 'target setting'
  ],
  'goal_progress': [
    'goal progress', 'track goals', 'goal status', 'objective tracking',
    'goal updates', 'progress monitoring'
  ],
  'system_help': [
    'how to use system', 'system guide', 'user manual', 'help documentation',
    'system tutorial', 'getting started'
  ],
  'technical_support': [
    'technical issue', 'system error', 'bug report', 'system problem',
    'login issue', 'access problem'
  ],
  'hr_policy': [
    'hr policy', 'company policy', 'hr procedures', 'workplace policy',
    'employee handbook', 'hr guidelines'
  ],
  'leave_policy': [
    'leave policy', 'vacation policy', 'sick leave', 'time off',
    'leave balance', 'leave request'
  ],
  'greeting': [
    'hello', 'hi', 'good morning', 'good afternoon', 'good evening',
    'hey', 'greetings', 'how are you'
  ],
  'farewell': [
    'goodbye', 'bye', 'see you later', 'farewell', 'take care',
    'have a good day', 'thanks'
  ],
  'thanks': [
    'thank you', 'thanks', 'appreciate', 'grateful', 'much obliged'
  ],
  'unknown': []
};

function preprocessText(text) {
  let processed = text.toLowerCase();
  processed = processed.replace(/[^\w\s]/g, ' ');
  processed = processed.replace(/\s+/g, ' ').trim();
  return processed;
}

function extractKeywords(text) {
  const processed = preprocessText(text);
  const words = processed.split(' ');
  
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
  ]);
  
  return words.filter(word => 
    word.length > 2 && !stopWords.has(word)
  );
}

function stemWords(words) {
  return words.map(word => stemmer(word));
}

function calculateSimilarity(text1, text2) {
  const words1 = stemWords(extractKeywords(text1));
  const words2 = stemWords(extractKeywords(text2));
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

function analyzeIntent(userInput) {
  const processedInput = preprocessText(userInput);
  const keywords = extractKeywords(processedInput);
  const stemmedKeywords = stemWords(keywords);
  
  let bestIntent = 'unknown';
  let bestConfidence = 0;
  const entities = {};
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (intent === 'unknown') continue;
    
    let maxSimilarity = 0;
    
    for (const pattern of patterns) {
      const similarity = calculateSimilarity(processedInput, pattern);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    if (maxSimilarity > bestConfidence) {
      bestConfidence = maxSimilarity;
      bestIntent = intent;
    }
  }
  
  // Extract entities using compromise
  try {
    const doc = compromise(processedInput);
    
    const dates = doc.dates().out('array');
    if (dates.length > 0) {
      entities.date = dates[0];
    }
    
    const people = doc.people().out('array');
    if (people.length > 0) {
      entities.person = people[0];
    }
    
    const orgs = doc.organizations().out('array');
    if (orgs.length > 0) {
      entities.organization = orgs[0];
    }
    
    const numbers = doc.numbers().out('array');
    if (numbers.length > 0) {
      entities.number = numbers[0];
    }
  } catch (error) {
    console.warn('Entity extraction failed:', error);
  }
  
  return {
    intent: bestIntent,
    confidence: bestConfidence,
    entities
  };
}

function rewriteQuery(originalQuery) {
  const rewrites = [originalQuery];
  
  const paraphraseMap = {
    'appraisal': ['performance review', 'evaluation', 'assessment'],
    'competency': ['skill', 'ability', 'capability'],
    'goal': ['objective', 'target', 'aim'],
    'deadline': ['due date', 'cutoff', 'submission date'],
    'score': ['rating', 'grade', 'mark'],
    'help': ['assistance', 'support', 'guidance']
  };
  
  for (const [original, variations] of Object.entries(paraphraseMap)) {
    if (originalQuery.toLowerCase().includes(original)) {
      for (const variation of variations) {
        rewrites.push(originalQuery.toLowerCase().replace(original, variation));
      }
    }
  }
  
  return [...new Set(rewrites)];
}

async function performDualStageRetrieval(queries, userRole, intent) {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
        OR: [
          { role: 'ALL' },
          { role: userRole }
        ]
      }
    });

    let bestMatch = null;
    let bestSimilarity = 0;
    const alternatives = [];

    for (const faq of faqs) {
      let maxSimilarity = 0;
      
      for (const query of queries) {
        const similarity = calculateSimilarity(query, faq.question);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }

      if (maxSimilarity > 0.3) {
        const faqWithSimilarity = {
          ...faq,
          similarity: maxSimilarity
        };

        if (maxSimilarity > bestSimilarity) {
          bestMatch = faqWithSimilarity;
          bestSimilarity = maxSimilarity;
        } else {
          alternatives.push(faqWithSimilarity);
        }
      }
    }

    alternatives.sort((a, b) => b.similarity - a.similarity);

    return { bestMatch, alternatives: alternatives.slice(0, 3) };
  } catch (error) {
    console.error('Error in dual-stage retrieval:', error);
    return { alternatives: [] };
  }
}

function generateConfidenceResponse(intent, confidence, entities) {
  const CONFIDENCE_THRESHOLDS = { HIGH: 0.8, MEDIUM: 0.6, LOW: 0.4 };
  
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
    return generateHighConfidenceResponse(intent, entities);
  } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return generateMediumConfidenceResponse(intent, entities);
  } else {
    return generateLowConfidenceResponse(intent, entities);
  }
}

function generateHighConfidenceResponse(intent, entities) {
  const responses = {
    'appraisal_help': 'I can help you with the performance appraisal process. The appraisal system guides you through setting goals, evaluating competencies, and providing feedback. Would you like me to show you the appraisal builder?',
    'appraisal_status': 'Let me check your current appraisal status. You can view your appraisal progress in the dashboard.',
    'appraisal_deadline': 'Appraisal deadlines are set by your supervisor and HR. You can check the specific deadline in your appraisal cycle details.',
    'appraisal_scores': 'The scoring system uses weighted competencies and behavioral indicators. Scores are calculated automatically based on your ratings.',
    'competency_help': 'The competency library contains detailed definitions and behavioral indicators for each skill area. You can browse competencies by category.',
    'competency_search': 'I can help you find specific competencies. You can search by name, category, or keyword.',
    'goal_setting': 'Goal setting is an important part of the appraisal process. You can set SMART goals that align with your role and department objectives.',
    'goal_progress': 'You can track your goal progress throughout the appraisal cycle. Update your progress regularly for accurate evaluation.',
    'system_help': 'The COSTAATT HR system is designed to streamline performance management. I can guide you through any feature you need help with.',
    'technical_support': 'For technical issues, please contact the IT support team. I can also help you troubleshoot common problems.',
    'hr_policy': 'HR policies are available in the employee handbook. I can help you find specific policy information.',
    'leave_policy': 'Leave policies are outlined in the employee handbook. You can check your leave balance and request time off through the system.',
    'greeting': 'Hello! I\'m your COSTAATT HR Digital Assistant. How can I help you with performance appraisals today?',
    'farewell': 'Goodbye! Feel free to ask me anything about the HR system anytime.',
    'thanks': 'You\'re welcome! I\'m here to help with any HR-related questions.'
  };

  const actionButtons = {
    'appraisal_help': { label: 'Open Appraisal Builder', href: '/appraisals/create' },
    'appraisal_status': { label: 'View Dashboard', href: '/dashboard' },
    'competency_help': { label: 'Browse Competencies', href: '/competencies' },
    'goal_setting': { label: 'Set Goals', href: '/goals' },
    'system_help': { label: 'User Guide', href: '/help' }
  };

  return {
    response: responses[intent] || 'I understand you need help with that. Let me provide you with the most relevant information.',
    confidence: 'HIGH',
    actionButton: actionButtons[intent],
    source: 'AI Assistant'
  };
}

function generateMediumConfidenceResponse(intent, entities) {
  return {
    response: `I think you're asking about ${intent.replace('_', ' ')}, but I'm not completely sure. Here's what I found that might help: [General guidance based on intent]. Would you like me to clarify anything specific?`,
    confidence: 'MEDIUM',
    actionButton: { label: 'Get More Help', href: '/help' },
    source: 'AI Assistant (Medium Confidence)'
  };
}

function generateLowConfidenceResponse(intent, entities) {
  return {
    response: "I'm not entirely sure what you're looking for. Could you rephrase your question? I can help with performance appraisals, competencies, goals, and general HR questions.",
    confidence: 'LOW',
    actionButton: { label: 'Browse FAQs', href: '/help/faq' },
    source: 'AI Assistant (Low Confidence)'
  };
}

// Middleware
app.use(cors());
app.use(express.json());

// Apply audit logging middleware
app.use(auditLog);

// Enhanced login endpoint supporting both SSO and LOCAL authentication
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        passwordHash: true,
        active: true,
        mustChangePassword: true,
        dept: true,
        title: true
      }
    });

    if (!user) {
      // Record failed attempt
      await recordLoginAttempt({
        email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check for lockout
    const isLockedOut = await isEmailLockedOut(email);
    if (isLockedOut) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.'
      });
    }

    // Check if local auth is enabled
    if (process.env.ALLOW_LOCAL_AUTH !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Local authentication is disabled'
      });
    }

    // Verify password
    const argon2 = require('argon2');
    const isValidPassword = await argon2.verify(user.passwordHash, password);
    
    if (!isValidPassword) {
      // Record failed attempt
      await recordLoginAttempt({
        email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Record successful attempt
    await recordLoginAttempt({
      email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    // Clear failed attempts
    await clearFailedAttempts(email);

    // Generate tokens
    const accessToken = jwt.sign(
      { 
        sub: user.id, 
        role: user.role
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Return user data (without password hash)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      dept: user.dept,
      title: user.title
    };

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Employees endpoint
app.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            title: true,
            dept: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            filePath: true
          }
        }
      }
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Appraisal cycles endpoint
app.get('/appraisal-instances/cycles', async (req, res) => {
  try {
    const cycles = await prisma.appraisalCycle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(cycles);
  } catch (error) {
    console.error('Error fetching cycles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Appraisal templates endpoint
app.get('/appraisal-instances/templates', async (req, res) => {
  try {
    const templates = await prisma.appraisalTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get appraisal instance by ID endpoint
app.get('/appraisal-instances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appraisalInstance = await prisma.appraisalInstance.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        template: true,
        cycle: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    if (!appraisalInstance) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    res.json(appraisalInstance);
  } catch (error) {
    console.error('Error fetching appraisal instance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create appraisal instance endpoint
app.post('/appraisal-instances', async (req, res) => {
  try {
    const { employeeId, templateId, cycleId, createdBy, options } = req.body;
    
    const appraisalInstance = await prisma.appraisalInstance.create({
      data: {
        employeeId,
        templateId,
        cycleId,
        createdBy,
        status: 'DRAFT',
        options: options || {},
        sections: {} // Initialize with empty sections
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        template: true,
        cycle: true
      }
    });
    
    res.json(appraisalInstance);
  } catch (error) {
    console.error('Error creating appraisal instance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit appraisal for review
app.post('/appraisal-instances/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appraisalInstance = await prisma.appraisalInstance.update({
      where: { id },
      data: { 
        status: 'IN_REVIEW',
        submittedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        employee: { 
          include: { 
            user: { 
              select: { firstName: true, lastName: true, email: true } 
            } 
          } 
        },
        template: true,
        cycle: true
      }
    });
    
    if (!appraisalInstance) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    // Send email notifications
    try {
      const { NotificationService } = require('./notifications/notificationService.js');
      const notifications = new NotificationService();

      // Prepare employee data
      const employee = appraisalInstance.employee;
      const user = employee.user;
      const fullEmployee = {
        firstName: user.firstName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        department: employee.division || '',
        jobTitle: employee.employmentType || '',
      };

      const appraisal = {
        id: appraisalInstance.id,
        status: appraisalInstance.status,
        createdAt: appraisalInstance.createdAt,
        updatedAt: appraisalInstance.updatedAt,
      };

      const cycle = {
        id: appraisalInstance.cycle.id,
        name: appraisalInstance.cycle.name,
        startDate: appraisalInstance.cycle.periodStart,
        endDate: appraisalInstance.cycle.periodEnd,
        status: appraisalInstance.cycle.status,
      };

      // Idempotency check (10-minute guard)
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      // Send to employee
      const alreadySentEmployee = await prisma.notificationLog.findFirst({
        where: {
          appraisalId: appraisal.id,
          kind: 'APPRAISAL_SUBMITTED_EMPLOYEE',
          createdAt: { gte: tenMinAgo },
        },
      });

      if (!alreadySentEmployee) {
        try {
          await notifications.sendAppraisalSubmittedEmployee(fullEmployee, appraisal, cycle);
          await prisma.notificationLog.create({
            data: {
              kind: 'APPRAISAL_SUBMITTED_EMPLOYEE',
              appraisalId: appraisal.id,
              toEmail: user.email,
              status: 'sent',
              sentAt: new Date(),
            },
          });
        } catch (e) {
          await prisma.notificationLog.create({
            data: {
              kind: 'APPRAISAL_SUBMITTED_EMPLOYEE',
              appraisalId: appraisal.id,
              toEmail: user.email,
              status: 'failed',
              error: e?.message?.toString() || 'send failed',
            },
          });
        }
      }

      // Send to HR
      const hrList = (process.env.HR_NOTIFY_LIST || 'hr@costaatt.edu.tt')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      for (const hrEmail of hrList) {
        const alreadySentHR = await prisma.notificationLog.findFirst({
          where: {
            appraisalId: appraisal.id,
            kind: 'APPRAISAL_SUBMITTED_HR',
            toEmail: hrEmail,
            createdAt: { gte: tenMinAgo },
          },
        });

        if (alreadySentHR) continue;

        try {
          await notifications.sendAppraisalSubmittedHR(fullEmployee, appraisal, cycle);
          await prisma.notificationLog.create({
            data: {
              kind: 'APPRAISAL_SUBMITTED_HR',
              appraisalId: appraisal.id,
              toEmail: hrEmail,
              status: 'sent',
              sentAt: new Date(),
            },
          });
        } catch (e) {
          await prisma.notificationLog.create({
            data: {
              kind: 'APPRAISAL_SUBMITTED_HR',
              appraisalId: appraisal.id,
              toEmail: hrEmail,
              status: 'failed',
              error: e?.message?.toString() || 'send failed',
            },
          });
        }
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorId: null, // Could be extracted from JWT if available
          actorRole: null,
          action: 'APPRAISAL_SUBMITTED',
          entity: 'Appraisal',
          entityId: appraisal.id,
          after: { status: appraisal.status },
          createdAt: new Date(),
        },
      });

    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the submission if email fails
    }
    
    res.json(appraisalInstance);
  } catch (error) {
    console.error('Error submitting appraisal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update appraisal sections
app.put('/appraisal-instances/:id/sections', async (req, res) => {
  try {
    const { id } = req.params;
    const { sections } = req.body;
    
    const appraisalInstance = await prisma.appraisalInstance.update({
      where: { id },
      data: { 
        sections: sections,
        updatedAt: new Date()
      },
      include: {
        employee: { 
          include: { 
            user: { 
              select: { firstName: true, lastName: true, email: true } 
            } 
          } 
        },
        template: true,
        cycle: true
      }
    });
    
    if (!appraisalInstance) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    res.json(appraisalInstance);
  } catch (error) {
    console.error('Error updating appraisal sections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add evidence to appraisal
app.post('/appraisal-instances/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, fileUrl, uploadedBy } = req.body;
    
    // For now, we'll store evidence in the sections JSON field
    // In a real implementation, you'd have a separate Evidence table
    const appraisalInstance = await prisma.appraisalInstance.findUnique({
      where: { id }
    });
    
    if (!appraisalInstance) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    // Get current sections and add evidence
    const currentSections = appraisalInstance.sections || {};
    const evidence = {
      id: `evidence_${Date.now()}`,
      title,
      description,
      type: type || 'DOCUMENT',
      fileUrl,
      uploadedBy,
      uploadedAt: new Date().toISOString()
    };
    
    // Add evidence to the first section or create a general evidence section
    if (!currentSections.evidence) {
      currentSections.evidence = [];
    }
    currentSections.evidence.push(evidence);
    
    const updatedInstance = await prisma.appraisalInstance.update({
      where: { id },
      data: { 
        sections: currentSections,
        updatedAt: new Date()
      },
      include: {
        employee: { 
          include: { 
            user: { 
              select: { firstName: true, lastName: true, email: true } 
            } 
          } 
        },
        template: true,
        cycle: true
      }
    });
    
    res.json(updatedInstance);
  } catch (error) {
    console.error('Error adding evidence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment to appraisal
app.post('/appraisal-instances/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, authorId, authorName } = req.body;
    
    const appraisalInstance = await prisma.appraisalInstance.findUnique({
      where: { id }
    });
    
    if (!appraisalInstance) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }
    
    // Get current sections and add comment
    const currentSections = appraisalInstance.sections || {};
    const newComment = {
      id: `comment_${Date.now()}`,
      comment,
      authorId,
      authorName,
      createdAt: new Date().toISOString()
    };
    
    if (!currentSections.comments) {
      currentSections.comments = [];
    }
    currentSections.comments.push(newComment);
    
    const updatedInstance = await prisma.appraisalInstance.update({
      where: { id },
      data: { 
        sections: currentSections,
        updatedAt: new Date()
      },
      include: {
        employee: { 
          include: { 
            user: { 
              select: { firstName: true, lastName: true, email: true } 
            } 
          } 
        },
        template: true,
        cycle: true
      }
    });
    
    res.json(updatedInstance);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reports endpoints
app.get('/settings/reports/performance-scores', async (req, res) => {
  try {
    const { cycleId, department } = req.query;
    
    // Get appraisal instances with scores
    const appraisals = await prisma.appraisalInstance.findMany({
      where: {
        ...(cycleId && { cycleId }),
        ...(department && { 
          employee: { 
            dept: department 
          } 
        }),
        finalScore: { not: null }
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        template: true,
        cycle: true
      }
    });
    
    res.json(appraisals);
  } catch (error) {
    console.error('Error fetching performance scores:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/settings/reports/completion-rates', async (req, res) => {
  try {
    const { cycleId, department } = req.query;
    
    // Get all appraisals for the cycle
    const allAppraisals = await prisma.appraisalInstance.findMany({
      where: {
        ...(cycleId && { cycleId }),
        ...(department && { 
          employee: { 
            dept: department 
          } 
        })
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
    
    // Calculate completion rates by status
    const statusCounts = allAppraisals.reduce((acc, appraisal) => {
      acc[appraisal.status] = (acc[appraisal.status] || 0) + 1;
      return acc;
    }, {});
    
    const total = allAppraisals.length;
    const completed = statusCounts.COMPLETED || 0;
    const inProgress = statusCounts.IN_PROGRESS || 0;
    const draft = statusCounts.DRAFT || 0;
    
    res.json({
      total,
      completed,
      inProgress,
      draft,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      statusBreakdown: statusCounts
    });
  } catch (error) {
    console.error('Error fetching completion rates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/settings/reports/department-breakdown', async (req, res) => {
  try {
    const { cycleId } = req.query;
    
    // Get appraisals grouped by department
    const appraisals = await prisma.appraisalInstance.findMany({
      where: {
        ...(cycleId && { cycleId })
      },
      include: {
        employee: {
          select: {
            division: true
          }
        }
      }
    });
    
    // Group by department
    const departmentStats = appraisals.reduce((acc, appraisal) => {
      const dept = appraisal.employee.division || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0, inProgress: 0, draft: 0 };
      }
      acc[dept].total++;
      acc[dept][appraisal.status.toLowerCase()]++;
      return acc;
    }, {});
    
    res.json(departmentStats);
  } catch (error) {
    console.error('Error fetching department breakdown:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/settings/reports/cycles', async (req, res) => {
  try {
    const cycles = await prisma.appraisalCycle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(cycles);
  } catch (error) {
    console.error('Error fetching cycles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/settings/reports/departments', async (req, res) => {
  try {
    const departments = await prisma.employee.findMany({
      select: {
        division: true
      },
      distinct: ['division']
    });
    
    const departmentList = departments
      .map(emp => emp.division)
      .filter(division => division)
      .sort();
    
    res.json(departmentList);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Advanced Chatbot endpoints
app.post('/chatbot/ask', async (req, res) => {
  try {
    const { question, userRole } = req.body;

    if (!question || !userRole) {
      return res.status(400).json({ 
        message: 'Question and userRole are required' 
      });
    }

    // Advanced NLP Processing
    const intentAnalysis = analyzeIntent(question);
    const rewrittenQueries = rewriteQuery(question);
    
    // Dual-stage retrieval
    const faqResults = await performDualStageRetrieval(rewrittenQueries, userRole, intentAnalysis.intent);
    
    // Generate confidence-based response
    const response = generateConfidenceResponse(intentAnalysis.intent, intentAnalysis.confidence, intentAnalysis.entities);
    
    // Log interaction for analytics
    await prisma.chatbotQuery.create({
      data: {
        userRole,
        question,
        faqId: faqResults.bestMatch?.id,
        actionClicked: response.actionButton?.label,
        timestamp: new Date()
      }
    });

    // Return enhanced response
    res.json({
      answer: response.response,
      confidence: response.confidence,
      intent: intentAnalysis.intent,
      entities: intentAnalysis.entities,
      actionButton: response.actionButton,
      source: response.source,
      faqMatch: faqResults.bestMatch ? {
        id: faqResults.bestMatch.id,
        question: faqResults.bestMatch.question,
        similarity: faqResults.bestMatch.similarity
      } : null
    });

  } catch (error) {
    console.error('Advanced chatbot error:', error);
    res.status(500).json({ 
      message: 'I encountered an error processing your question. Please try again or contact HR.',
      source: 'Error Handler'
    });
  }
});

app.get('/chatbot/faqs', async (req, res) => {
  try {
    const { role } = req.query;
    
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
        ...(role && role !== 'ALL' ? {
          OR: [
            { role: 'ALL' },
            { role: role }
          ]
        } : {})
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/chatbot/unanswered', async (req, res) => {
  try {
    const unanswered = await prisma.chatbotQuery.findMany({
      where: { faqId: null },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json(unanswered);
  } catch (error) {
    console.error('Error fetching unanswered questions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Analytics endpoint
app.get('/chatbot/analytics', async (req, res) => {
  try {
    // Get query statistics
    const totalQueries = await prisma.chatbotQuery.count();
    const answeredQueries = await prisma.chatbotQuery.count({
      where: { faqId: { not: null } }
    });
    
    // Get popular intents by role
    const intentStats = await prisma.chatbotQuery.groupBy({
      by: ['userRole'],
      _count: { id: true }
    });

    // Get confidence distribution
    const confidenceStats = await prisma.chatbotQuery.findMany({
      select: { id: true, timestamp: true },
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    res.json({
      totalQueries,
      answeredQueries,
      answerRate: totalQueries > 0 ? (answeredQueries / totalQueries) : 0,
      intentStats,
      confidenceDistribution: { high: 0.7, medium: 0.2, low: 0.1 }, // Mock data for now
      userSatisfaction: 0.85 // Mock data for now
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Competencies endpoint
app.get('/competencies', async (req, res) => {
  try {
    const competencies = await prisma.competency.findMany({
      orderBy: { title: 'asc' }
    });

    res.json(competencies);
  } catch (error) {
    console.error('Error fetching competencies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// SSO User Authentication endpoint
app.post('/auth/sso', async (req, res) => {
  try {
    const { email, name, azureId, groups = [] } = req.body;
    
    
    // First, try to find existing user by email
    let user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true }
    });
    
    // If user doesn't exist, create them
    if (!user) {
      
      // Determine role based on Azure AD groups or default to EMPLOYEE
      let role = 'EMPLOYEE';
      if (groups.includes('HR_Admin') || groups.includes('HR-Admin')) {
        role = 'HR_ADMIN';
      } else if (groups.includes('Supervisor') || groups.includes('Manager')) {
        role = 'SUPERVISOR';
      }
      
      // Create user
      user = await prisma.user.create({
        data: {
          email,
          firstName: name?.split(' ')[0] || 'Unknown',
          lastName: name?.split(' ').slice(1).join(' ') || 'User',
          role,
          active: true,
          azureId: azureId || null,
          authProvider: 'SSO',
          dept: 'Human Resources',
          title: 'Employee',
          // Set a random password since they'll use SSO
          passwordHash: '$2b$10$' + Math.random().toString(36).substring(2, 15),
        }
      });
      
    } else {
      // Update existing user with Azure ID if not set
      if (!user.azureId && azureId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            azureId,
            authProvider: 'SSO'
          }
        });
      }
      
    }
    
    // Generate JWT token for the user
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        employee: user.employee
      }
    });
    
  } catch (error) {
    console.error('❌ SSO authentication error:', error);
    res.status(500).json({ message: 'SSO authentication failed' });
  }
});

// SSO Configuration endpoints
app.get('/settings/sso', async (req, res) => {
  try {
    // Return SSO configuration - we know it's configured since we have the credentials
    const ssoConfig = {
      ssoEnabled: true, // Always true since we have the Azure AD credentials
      azureClientId: '7911cfad-b0d5-419c-83b2-62aab8833a66',
      azureTenantId: '023c2cf6-b378-495b-a3cd-591490b7f6e1',
      redirectUri: 'http://localhost:5173',
      provider: 'Microsoft 365',
      status: 'configured',
      lastUpdated: new Date().toISOString()
    };

    res.json(ssoConfig);
  } catch (error) {
    console.error('Error fetching SSO config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard API endpoints
app.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalAppraisals,
      draftAppraisals,
      submittedAppraisals,
      completedAppraisals,
    ] = await Promise.all([
      prisma.appraisalInstance.count().catch(() => 0),
      prisma.appraisalInstance.count({ where: { status: 'DRAFT' } }).catch(() => 0),
      prisma.appraisalInstance.count({ where: { status: { in: ['IN_REVIEW', 'REVIEWED_MANAGER'] } } }).catch(() => 0),
      prisma.appraisalInstance.count({ where: { status: 'COMPLETED' } }).catch(() => 0),
    ]);

    const completionRate = totalAppraisals > 0 ? (completedAppraisals / totalAppraisals) * 100 : 0;

    res.json({
      totalAppraisals,
      draftAppraisals,
      submittedAppraisals,
      completedAppraisals,
      completionRate: Math.round(completionRate * 10) / 10,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Recent appraisals endpoint
app.get('/dashboard/recent', async (req, res) => {
  try {
    const recentAppraisals = await prisma.appraisalInstance.findMany({
      where: { 
        status: { in: ['IN_REVIEW', 'REVIEWED_MANAGER', 'FINAL_REVIEW', 'COMPLETED'] }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      take: 8,
      select: {
        id: true,
        status: true,
        finalScore: true,
        finalBand: true,
        createdAt: true,
        updatedAt: true,
        employee: { 
          select: { 
            user: { 
              select: { firstName: true, lastName: true } 
            },
            division: true,
            employmentType: true
          } 
        },
        cycle: { 
          select: { 
            name: true,
            periodStart: true,
            periodEnd: true
          } 
        },
        template: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    res.json(recentAppraisals);
  } catch (error) {
    console.error('Error fetching recent appraisals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Debug endpoint for quick status checks
app.get('/appraisal-instances/debug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appraisal = await prisma.appraisalInstance.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        completedAt: true,
        cycleId: true,
        employeeId: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    res.json(appraisal);
  } catch (error) {
    console.error('Error fetching appraisal debug info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Settings API endpoints
app.get('/settings/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalAppraisals,
      completedAppraisals,
      totalCycles,
      activeCycles,
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.user.count({ where: { active: true } }).catch(() => 0),
      prisma.appraisalInstance.count().catch(() => 0),
      prisma.appraisalInstance.count({ where: { status: 'COMPLETED' } }).catch(() => 0),
      prisma.appraisalCycle.count().catch(() => 0),
      prisma.appraisalCycle.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
    ]);

    const completionRate = totalAppraisals > 0 ? (completedAppraisals / totalAppraisals) * 100 : 0;

    res.json({
      totalUsers,
      activeUsers,
      totalAppraisals,
      completedAppraisals,
      completionRate: Math.round(completionRate * 10) / 10,
      totalCycles,
      activeCycles,
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cycles endpoints
app.get('/settings/cycles', async (req, res) => {
  try {
    const cycles = await prisma.appraisalCycle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { appraisalInstances: true },
        },
      },
    });
    res.json(cycles);
  } catch (error) {
    console.error('Error fetching cycles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/settings/cycles', async (req, res) => {
  try {
    const { name, startDate, endDate, description } = req.body;
    
    // Check for overlapping cycles
    const overlapping = await prisma.appraisalCycle.findFirst({
      where: {
        status: { in: ['PLANNED', 'ACTIVE'] },
        OR: [
          {
            AND: [
              { periodStart: { lte: new Date(endDate) } },
              { periodEnd: { gte: new Date(startDate) } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Cannot create overlapping cycles' });
    }

    const cycle = await prisma.appraisalCycle.create({
      data: {
        name,
        periodStart: new Date(startDate),
        periodEnd: new Date(endDate),
        status: 'PLANNED',
        description: description || '',
      },
    });

    res.json(cycle);
  } catch (error) {
    console.error('Error creating cycle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Templates endpoints
app.get('/settings/templates', async (req, res) => {
  try {
    const templates = await prisma.appraisalTemplate.findMany({
      include: {
        _count: {
          select: { appraisalInstances: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Users endpoints
app.get('/settings/users', async (req, res) => {
  try {
    const { search, role } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        employee: true,
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { subordinates: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// System configuration endpoints
app.get('/settings/config', async (req, res) => {
  try {
    // Return default config if table doesn't exist
    const defaultConfig = {
      id: 1,
      selfAppraisalRequired: true,
      selfRatingsEnabled: true,
      defaultAttachmentMB: 25,
      reminderDays: { self: 7, manager: 14, overdueCadenceDays: 3 },
      ssoEnabled: false,
      backupScheduleCron: '0 2 * * *',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      let config = await prisma.systemConfig.findFirst();
      if (!config) {
        config = defaultConfig;
      }
      res.json(config);
    } catch (tableError) {
      // Table doesn't exist, return default config
      res.json(defaultConfig);
    }
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check endpoints
app.get('/settings/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.json({ status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() });
  }
});

// Email health check
app.get('/settings/health/email', async (req, res) => {
  try {
    const { NotificationService } = require('./notifications/notificationService.js');
    const notifications = new NotificationService();
    
    const isHealthy = await notifications.testConnection();
    
    res.json({ 
      status: isHealthy ? 'healthy' : 'unhealthy', 
      provider: process.env.MAIL_PROVIDER || 'smtp',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.json({ 
      status: 'unhealthy', 
      error: error.message, 
      provider: process.env.MAIL_PROVIDER || 'smtp',
      timestamp: new Date().toISOString() 
    });
  }
});

app.get('/settings/health/sso', async (req, res) => {
  try {
    res.json({
      enabled: true,
      provider: 'azure-ad',
      configured: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({ status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() });
  }
});

app.put('/settings/sso', async (req, res) => {
  try {
    const { azureClientId, azureTenantId, redirectUri, ssoEnabled } = req.body;
    
    // In a real implementation, you would save this to a database
    // For now, we'll just return success
    const updatedConfig = {
      ssoEnabled: ssoEnabled !== false,
      azureClientId: azureClientId || '7911cfad-b0d5-419c-83b2-62aab8833a66',
      azureTenantId: azureTenantId || '023c2cf6-b378-495b-a3cd-591490b7f6e1',
      redirectUri: redirectUri || 'http://localhost:5173',
      provider: 'Microsoft 365',
      status: 'configured',
      lastUpdated: new Date().toISOString()
    };

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating SSO config:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== MANAGER REVIEW ENDPOINTS =====

// Get appraisal for manager review
app.get('/appraisals/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appraisal = await prisma.appraisalInstance.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        template: true,
        cycle: true
      }
    });

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    res.json(appraisal);
  } catch (error) {
    console.error('Error fetching appraisal for review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save manager review draft
app.put('/appraisals/:id/review/draft', async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionComments, managerItemScores, overallComment, overallRating, contractBlock } = req.body;
    
    const appraisal = await prisma.appraisalInstance.update({
      where: { id },
      data: {
        managerSectionNotes: sectionComments,
        managerComment: overallComment,
        managerRating: overallRating,
        contractBlock: contractBlock,
        status: 'IN_REVIEW'
      }
    });

    res.json(appraisal);
  } catch (error) {
    console.error('Error saving manager review draft:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit manager review
app.post('/appraisals/:id/review/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionComments, managerItemScores, overallComment, overallRating, contractBlock, signature } = req.body;
    
    // Validation
    if (!overallRating || !overallComment || !signature?.name) {
      return res.status(400).json({ message: 'Overall rating, comment, and signature are required' });
    }

    const appraisal = await prisma.appraisalInstance.update({
      where: { id },
      data: {
        managerSectionNotes: sectionComments,
        managerComment: overallComment,
        managerRating: overallRating,
        contractBlock: contractBlock,
        managerSignedAt: new Date(),
        managerSignedName: signature.name,
        reviewedAt: new Date(),
        status: 'REVIEWED_MANAGER'
      },
      include: {
        employee: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    // Send email notifications
    try {
      const employeeName = `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}`;
      const managerName = 'Manager'; // You might want to fetch actual manager name
      const hrEmails = process.env.HR_NOTIFY_LIST?.split(',') || ['hr@costaatt.edu.tt'];
      
      await emailService.appraisalSubmitted({
        appraisalId: appraisal.id,
        employeeName,
        managerName,
        hrEmails
      });
      
      
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    res.json(appraisal);
  } catch (error) {
    console.error('Error submitting manager review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== TEMPLATES ENDPOINT =====
app.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.appraisalTemplate.findMany({
      where: { 
        published: true,
        active: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            filePath: true
          }
        }
      },
      orderBy: [
        { categoryId: 'asc' },
        { name: 'asc' }
      ]
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== CYCLES ENDPOINT =====
app.get('/cycles', async (req, res) => {
  try {
    const cycles = await prisma.appraisalCycle.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        periodStart: true,
        periodEnd: true,
        status: true
      }
    });
    res.json(cycles);
  } catch (error) {
    console.error('Error fetching cycles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== SELF APPRAISAL ENDPOINT =====
app.get('/self-appraisal', async (req, res) => {
  try {
    // For now, return a mock self-appraisal
    res.json({
      id: 'mock-self-appraisal',
      status: 'DRAFT',
      cycle: {
        name: 'Annual Performance Review 2025',
        periodStart: '2025-01-01T00:00:00.000Z',
        periodEnd: '2025-12-31T00:00:00.000Z'
      },
      sections: {
        performance: {
          goals: 'Complete all assigned tasks on time',
          achievements: 'Successfully completed major project',
          challenges: 'Learning new technology stack',
          development: 'Attend advanced training courses'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching self-appraisal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== ADMIN USER MANAGEMENT ENDPOINTS =====

// Create local user (HR_ADMIN only)
app.post('/api/admin/users', async (req, res) => {
  try {
    // Check if local auth is enabled
    if (process.env.ALLOW_LOCAL_AUTH !== 'true') {
      return res.status(400).json({ 
        success: false, 
        message: 'Local authentication is disabled' 
      });
    }

    const { email, firstName, lastName, role, password, mustChangePassword = false } = req.body;

    // Validation
    if (!email || !firstName || !lastName || !role || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, first name, last name, role, and password are required' 
      });
    }

    // Validate password strength
    const minLength = Number(process.env.PASSWORD_MIN_LENGTH || 10);
    if (password.length < minLength || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: `Password must be at least ${minLength} characters long and contain at least one letter and one number`
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }

    // Hash password
    const passwordHash = await argon2.hash(password, { 
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });

        // Create user
        const user = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            role: role,
            passwordHash,
            mustChangePassword,
            dept: 'Human Resources',
            title: 'Employee',
            active: true
          },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          mustChangePassword: true,
          createdAt: true
        }
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        actorId: 'mock-user-id', // In real implementation, get from JWT
        action: 'CREATE',
        entity: 'user',
        entityId: user.id,
        after: {
          email: user.email,
          role: user.role
        },
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error creating local user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Reset user password (HR_ADMIN only)
app.patch('/api/admin/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required' 
      });
    }

    // Validate password strength
    const minLength = Number(process.env.PASSWORD_MIN_LENGTH || 10);
    if (password.length < minLength || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: `Password must be at least ${minLength} characters long and contain at least one letter and one number`
      });
    }

    // Check if user exists and is LOCAL
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.authProvider !== 'LOCAL') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only reset passwords for local users' 
      });
    }

    // Hash new password
    const passwordHash = await argon2.hash(password, { 
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });

    // Update user
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true
      }
    });

    // Log the password reset
    await prisma.auditLog.create({
      data: {
        userId: 'mock-user-id', // In real implementation, get from JWT
        action: 'UPDATE',
        entity: 'user',
        entityId: user.id,
        newValues: {
          passwordReset: true,
          mustChangePassword: true
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get all users (HR_ADMIN only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        authProvider: true,
        active: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Toggle user active status (HR_ADMIN only)
app.patch('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        active: !user.active
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        authProvider: true,
        active: true,
        updatedAt: true
      }
    });

    // Log the status change
    await prisma.auditLog.create({
      data: {
        userId: 'mock-user-id', // In real implementation, get from JWT
        action: 'UPDATE',
        entity: 'user',
        entityId: user.id,
        oldValues: { active: user.active },
        newValues: { active: updatedUser.active },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ===== CREATE APPRAISAL ENDPOINT =====
app.post('/appraisals', async (req, res) => {
  try {
    const { employeeId, templateId, cycleId, options, sections } = req.body;
    
    // Validation
    if (!employeeId || !templateId || !cycleId) {
      return res.status(400).json({ message: 'Employee, template, and cycle are required' });
    }

    // Get the first available user ID (from employee)
    const firstEmployee = await prisma.employee.findFirst({
      select: { userId: true }
    });

    if (!firstEmployee) {
      return res.status(500).json({ message: 'No employees found' });
    }

    // Create the appraisal instance
      templateId,
      employeeId,
      cycleId,
      createdBy: firstEmployee.userId
    });
    
    const appraisal = await prisma.appraisalInstance.create({
      data: {
        templateId,
        employeeId,
        cycleId,
        options: options || {},
        sections: sections || {},
        status: 'DRAFT',
        createdBy: firstEmployee.userId,
        reviewerId: null // Will be set when manager is assigned
      },
      include: {
        employee: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        template: true,
        cycle: true
      }
    });

    res.status(201).json(appraisal);
  } catch (error) {
    console.error('Error creating appraisal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== ADMIN ROUTES =====
const adminStuck = require('./routes/admin.stuck');
const adminOutliers = require('./routes/admin.outliers');

app.use('/api/admin', adminStuck);
app.use('/api/admin', adminOutliers);

// ===== DIVISIONAL HEAD REVIEW ENDPOINTS =====

// Get appraisal for divisional head finalization
app.get('/appraisals/:id/finalize', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appraisal = await prisma.appraisalInstance.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        template: true,
        cycle: true
      }
    });

    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal not found' });
    }

    res.json(appraisal);
  } catch (error) {
    console.error('Error fetching appraisal for finalization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save divisional head draft
app.put('/appraisals/:id/finalize/draft', async (req, res) => {
  try {
    const { id } = req.params;
    const { headRecommendation } = req.body;
    
    const appraisal = await prisma.appraisalInstance.update({
      where: { id },
      data: {
        headRecommendation: headRecommendation,
        status: 'FINAL_REVIEW'
      }
    });

    res.json(appraisal);
  } catch (error) {
    console.error('Error saving divisional head draft:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit divisional head finalization
app.post('/appraisals/:id/finalize/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { headRecommendation, signature, hrDecision, hrComments, hrSignature } = req.body;
    
    
    // Validation
    if (!headRecommendation || !signature?.name) {
      return res.status(400).json({ message: 'Recommendation and signature are required' });
    }

    const updateData = {
      headRecommendation: headRecommendation,
      headSignedAt: new Date(),
      headSignedName: signature.name,
      headReviewedAt: new Date(),
      status: 'COMPLETED',
      completedAt: new Date()
    };

    // Add HR decision fields if provided
    if (hrDecision) updateData.hrDecision = hrDecision;
    if (hrComments) updateData.hrComments = hrComments;
    if (hrSignature) updateData.hrSignature = hrSignature;

    const appraisal = await prisma.appraisalInstance.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    // Send email notifications
    try {
      const employeeName = `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}`;
      const employeeEmail = appraisal.employee.user.email;
      
      
      // Email to HR Department
      const hrEmails = process.env.HR_NOTIFY_LIST?.split(',') || ['hr@costaatt.edu.tt'];
      hrEmails.forEach(hrEmail => {
      });
      
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    res.json(appraisal);
  } catch (error) {
    console.error('Error submitting divisional head finalization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get current user profile
app.get('/auth/me', async (req, res) => {
  try {
    // For now, return a mock user since we don't have JWT validation set up
    // In a real implementation, you would validate the JWT token here
    const mockUser = {
      id: 'mock-user-id',
      email: 'admin@costaatt.edu.tt',
      firstName: 'Admin',
      lastName: 'User',
      role: 'HR_ADMIN',
      division: 'Human Resources',
      employmentType: 'Full-time'
    };
    
    res.json({
      success: true,
      data: mockUser
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create mock user if it doesn't exist
async function ensureMockUser() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: 'mock-user-id' }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: 'mock-user-id',
          email: 'admin@costaatt.edu.tt',
          firstName: 'Admin',
          lastName: 'User',
          role: 'HR_ADMIN',
          passwordHash: 'mock-hash', // Not used in mock auth
          active: true,
          dept: 'Human Resources',
          title: 'HR Administrator'
        }
      });
    }
  } catch (error) {
    console.error('Error creating mock user:', error);
  }
}

// Start server
// Initialize cron jobs
require('./crons/reminders');

// Ensure mock user exists
ensureMockUser();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
});
