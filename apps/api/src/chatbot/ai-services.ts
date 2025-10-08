import natural from 'natural';
import compromise from 'compromise';
import { stemmer } from 'stemmer';

// Intent Classification System
export interface IntentClassification {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}

// Intent Patterns and Keywords
const INTENT_PATTERNS = {
  // Performance Appraisal Intents
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
  
  // Competency Intents
  'competency_help': [
    'competency library', 'competencies', 'skills assessment', 'competency framework',
    'behavioral indicators', 'competency definitions'
  ],
  'competency_search': [
    'find competency', 'search competencies', 'competency lookup', 'skill search',
    'competency categories', 'competency areas'
  ],
  
  // Goal Setting Intents
  'goal_setting': [
    'goal setting', 'set goals', 'performance goals', 'objective setting',
    'goal management', 'target setting'
  ],
  'goal_progress': [
    'goal progress', 'track goals', 'goal status', 'objective tracking',
    'goal updates', 'progress monitoring'
  ],
  
  // System Help Intents
  'system_help': [
    'how to use system', 'system guide', 'user manual', 'help documentation',
    'system tutorial', 'getting started'
  ],
  'technical_support': [
    'technical issue', 'system error', 'bug report', 'system problem',
    'login issue', 'access problem'
  ],
  
  // HR Policy Intents
  'hr_policy': [
    'hr policy', 'company policy', 'hr procedures', 'workplace policy',
    'employee handbook', 'hr guidelines'
  ],
  'leave_policy': [
    'leave policy', 'vacation policy', 'sick leave', 'time off',
    'leave balance', 'leave request'
  ],
  
  // General Intents
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

// Confidence Thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
};

// Natural Language Processing Utilities
export class NLPService {
  private static instance: NLPService;
  
  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  /**
   * Preprocess text for better matching
   */
  preprocessText(text: string): string {
    // Convert to lowercase
    let processed = text.toLowerCase();
    
    // Remove special characters but keep spaces
    processed = processed.replace(/[^\w\s]/g, ' ');
    
    // Remove extra whitespace
    processed = processed.replace(/\s+/g, ' ').trim();
    
    return processed;
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text: string): string[] {
    const processed = this.preprocessText(text);
    const words = processed.split(' ');
    
    // Remove stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
    ]);
    
    return words.filter(word => 
      word.length > 2 && !stopWords.has(word)
    );
  }

  /**
   * Stem words using Porter Stemmer
   */
  stemWords(words: string[]): string[] {
    return words.map(word => stemmer(word));
  }

  /**
   * Calculate similarity between two texts
   */
  calculateSimilarity(text1: string, text2: string): number {
    const words1 = this.stemWords(this.extractKeywords(text1));
    const words2 = this.stemWords(this.extractKeywords(text2));
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Detect intent from user input
   */
  detectIntent(userInput: string): IntentClassification {
    const processedInput = this.preprocessText(userInput);
    const keywords = this.extractKeywords(processedInput);
    const stemmedKeywords = this.stemWords(keywords);
    
    let bestIntent = 'unknown';
    let bestConfidence = 0;
    const entities: Record<string, string> = {};
    
    // Check each intent pattern
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (intent === 'unknown') continue;
      
      let maxSimilarity = 0;
      
      for (const pattern of patterns) {
        const similarity = this.calculateSimilarity(processedInput, pattern);
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
      
      // Extract dates
      const dates = doc.dates().out('array');
      if (dates.length > 0) {
        entities.date = dates[0];
      }
      
      // Extract people/names
      const people = doc.people().out('array');
      if (people.length > 0) {
        entities.person = people[0];
      }
      
      // Extract organizations
      const orgs = doc.organizations().out('array');
      if (orgs.length > 0) {
        entities.organization = orgs[0];
      }
      
      // Extract numbers
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

  /**
   * Rewrite query for better matching
   */
  rewriteQuery(originalQuery: string): string[] {
    const rewrites: string[] = [originalQuery];
    
    // Add paraphrases
    const paraphrases = this.generateParaphrases(originalQuery);
    rewrites.push(...paraphrases);
    
    // Add keyword variations
    const keywordVariations = this.generateKeywordVariations(originalQuery);
    rewrites.push(...keywordVariations);
    
    return [...new Set(rewrites)]; // Remove duplicates
  }

  /**
   * Generate paraphrases of the query
   */
  private generateParaphrases(query: string): string[] {
    const paraphrases: string[] = [];
    
    // Common paraphrases for HR terms
    const paraphraseMap: Record<string, string[]> = {
      'appraisal': ['performance review', 'evaluation', 'assessment'],
      'competency': ['skill', 'ability', 'capability'],
      'goal': ['objective', 'target', 'aim'],
      'deadline': ['due date', 'cutoff', 'submission date'],
      'score': ['rating', 'grade', 'mark'],
      'help': ['assistance', 'support', 'guidance']
    };
    
    for (const [original, variations] of Object.entries(paraphraseMap)) {
      if (query.toLowerCase().includes(original)) {
        for (const variation of variations) {
          paraphrases.push(query.toLowerCase().replace(original, variation));
        }
      }
    }
    
    return paraphrases;
  }

  /**
   * Generate keyword variations
   */
  private generateKeywordVariations(query: string): string[] {
    const variations: string[] = [];
    const keywords = this.extractKeywords(query);
    
    // Add singular/plural variations
    for (const keyword of keywords) {
      if (keyword.endsWith('s') && keyword.length > 3) {
        variations.push(query.replace(keyword, keyword.slice(0, -1)));
      } else {
        variations.push(query.replace(keyword, keyword + 's'));
      }
    }
    
    return variations;
  }
}

// Confidence-based Response System
export class ConfidenceResponseService {
  /**
   * Generate response based on confidence level
   */
  generateResponse(intent: string, confidence: number, entities: Record<string, string>): {
    response: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    actionButton?: { label: string; href: string };
    source?: string;
  } {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      return this.generateHighConfidenceResponse(intent, entities);
    } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      return this.generateMediumConfidenceResponse(intent, entities);
    } else {
      return this.generateLowConfidenceResponse(intent, entities);
    }
  }

  private generateHighConfidenceResponse(intent: string, entities: Record<string, string>): {
    response: string;
    confidence: 'HIGH';
    actionButton?: { label: string; href: string };
    source?: string;
  } {
    const responses: Record<string, string> = {
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

    const actionButtons: Record<string, { label: string; href: string }> = {
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

  private generateMediumConfidenceResponse(intent: string, entities: Record<string, string>): {
    response: string;
    confidence: 'MEDIUM';
    actionButton?: { label: string; href: string };
    source?: string;
  } {
    return {
      response: `I think you're asking about ${intent.replace('_', ' ')}, but I'm not completely sure. Here's what I found that might help: [General guidance based on intent]. Would you like me to clarify anything specific?`,
      confidence: 'MEDIUM',
      actionButton: { label: 'Get More Help', href: '/help' },
      source: 'AI Assistant (Medium Confidence)'
    };
  }

  private generateLowConfidenceResponse(intent: string, entities: Record<string, string>): {
    response: string;
    confidence: 'LOW';
    actionButton?: { label: string; href: string };
    source?: string;
  } {
    return {
      response: "I'm not entirely sure what you're looking for. Could you rephrase your question? I can help with performance appraisals, competencies, goals, and general HR questions.",
      confidence: 'LOW',
      actionButton: { label: 'Browse FAQs', href: '/help/faq' },
      source: 'AI Assistant (Low Confidence)'
    };
  }
}

// Advanced Analytics Service
export class AnalyticsService {
  /**
   * Track user interaction
   */
  static trackInteraction(userRole: string, question: string, intent: string, confidence: number, responseSource: string): void {
    // This would integrate with your analytics system
      userRole,
      question,
      intent,
      confidence,
      responseSource,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate insights for HR
   */
  static generateInsights(): {
    popularIntents: Array<{ intent: string; count: number }>;
    confidenceDistribution: { high: number; medium: number; low: number };
    userSatisfaction: number;
  } {
    // This would query your analytics database
    return {
      popularIntents: [
        { intent: 'appraisal_help', count: 45 },
        { intent: 'competency_help', count: 32 },
        { intent: 'goal_setting', count: 28 }
      ],
      confidenceDistribution: { high: 0.7, medium: 0.2, low: 0.1 },
      userSatisfaction: 0.85
    };
  }
}
