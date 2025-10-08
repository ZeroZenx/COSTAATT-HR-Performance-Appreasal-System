import { Controller, Post, Get, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { NLPService, ConfidenceResponseService, AnalyticsService } from './ai-services';

@Controller('chatbot')
export class AdvancedChatbotController {
  private nlpService: NLPService;
  private confidenceService: ConfidenceResponseService;

  constructor(private prisma: PrismaService) {
    this.nlpService = NLPService.getInstance();
    this.confidenceService = new ConfidenceResponseService();
  }

  /**
   * Advanced question processing with AI
   */
  @Post('ask')
  async askQuestion(
    @Body() body: { question: string; userRole: string },
    @Res() res: Response
  ) {
    try {
      const { question, userRole } = body;
      
      if (!question || !userRole) {
        return res.status(400).json({ 
          message: 'Question and userRole are required' 
        });
      }

      // Step 1: Natural Language Processing
      const intentAnalysis = this.nlpService.detectIntent(question);
      
      // Step 2: Query Rewriting for Better Matching
      const rewrittenQueries = this.nlpService.rewriteQuery(question);
      
      // Step 3: Dual-Stage Retrieval
      const faqResults = await this.performDualStageRetrieval(
        rewrittenQueries, 
        userRole, 
        intentAnalysis.intent
      );
      
      // Step 4: Generate Confidence-Based Response
      const response = this.confidenceService.generateResponse(
        intentAnalysis.intent,
        intentAnalysis.confidence,
        intentAnalysis.entities
      );
      
      // Step 5: Log Interaction for Analytics
      AnalyticsService.trackInteraction(
        userRole,
        question,
        intentAnalysis.intent,
        intentAnalysis.confidence,
        response.source || 'AI Assistant'
      );
      
      // Step 6: Store Query for Analytics
      await this.prisma.chatbotQuery.create({
        data: {
          userRole,
          question,
          faqId: faqResults.bestMatch?.id,
          actionClicked: response.actionButton?.label,
          timestamp: new Date()
        }
      });

      // Step 7: Return Enhanced Response
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
  }

  /**
   * Get role-specific FAQs with advanced filtering
   */
  @Get('faqs')
  async getFAQs(@Query('role') role?: string) {
    try {
      const faqs = await this.prisma.fAQ.findMany({
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

      return faqs;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  }

  /**
   * Get unanswered questions for HR review
   */
  @Get('unanswered')
  async getUnansweredQuestions() {
    try {
      const unanswered = await this.prisma.chatbotQuery.findMany({
        where: { faqId: null },
        orderBy: { timestamp: 'desc' },
        take: 50
      });

      return unanswered;
    } catch (error) {
      console.error('Error fetching unanswered questions:', error);
      throw error;
    }
  }

  /**
   * Get analytics insights for HR
   */
  @Get('analytics')
  async getAnalytics() {
    try {
      // Get query statistics
      const totalQueries = await this.prisma.chatbotQuery.count();
      const answeredQueries = await this.prisma.chatbotQuery.count({
        where: { faqId: { not: null } }
      });
      
      // Get popular intents
      const intentStats = await this.prisma.chatbotQuery.groupBy({
        by: ['userRole'],
        _count: { id: true }
      });

      // Get confidence distribution
      const confidenceStats = await this.prisma.chatbotQuery.findMany({
        select: { id: true, timestamp: true },
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      return {
        totalQueries,
        answeredQueries,
        answerRate: totalQueries > 0 ? (answeredQueries / totalQueries) : 0,
        intentStats,
        confidenceDistribution: AnalyticsService.generateInsights().confidenceDistribution,
        userSatisfaction: AnalyticsService.generateInsights().userSatisfaction
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Perform dual-stage retrieval (Vector Search + Cross-Encoder)
   */
  private async performDualStageRetrieval(
    queries: string[], 
    userRole: string, 
    intent: string
  ): Promise<{
    bestMatch?: any;
    alternatives: any[];
  }> {
    try {
      // Stage 1: Vector Search (Keyword-based for now)
      const faqs = await this.prisma.fAQ.findMany({
        where: {
          isActive: true,
          OR: [
            { role: 'ALL' },
            { role: userRole }
          ]
        }
      });

      let bestMatch: any = null;
      let bestSimilarity = 0;
      const alternatives: any[] = [];

      // Stage 2: Cross-Encoder Reranking
      for (const faq of faqs) {
        let maxSimilarity = 0;
        
        for (const query of queries) {
          const similarity = this.nlpService.calculateSimilarity(query, faq.question);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }

        if (maxSimilarity > 0.3) { // Threshold for relevance
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

      // Sort alternatives by similarity
      alternatives.sort((a, b) => b.similarity - a.similarity);

      return { bestMatch, alternatives: alternatives.slice(0, 3) };
    } catch (error) {
      console.error('Error in dual-stage retrieval:', error);
      return { alternatives: [] };
    }
  }
}
