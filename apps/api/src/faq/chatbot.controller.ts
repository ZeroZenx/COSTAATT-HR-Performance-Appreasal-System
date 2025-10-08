import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { FAQService } from './faq.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

interface ChatbotRequest {
  question: string;
  userRole: string;
}

interface ChatbotResponse {
  answer: string;
  faqId?: string;
  actionButton?: {
    text: string;
    url: string;
    method?: string;
  };
  source: 'FAQ' | 'UNKNOWN';
}

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private faqService: FAQService) {}

  @Post('ask')
  async askQuestion(
    @Body() request: ChatbotRequest,
    @CurrentUser() user: any
  ): Promise<ChatbotResponse> {
    const { question, userRole } = request;
    
    // Search for relevant FAQs
    const faqs = await this.faqService.searchFAQs(question, userRole);
    
    if (faqs.length > 0) {
      const bestMatch = faqs[0]; // Simple matching - could be improved with scoring
      
      // Log the query
      await this.faqService.logQuery(userRole, question, bestMatch.id);
      
      return {
        answer: bestMatch.answer,
        faqId: bestMatch.id,
        actionButton: bestMatch.actionButton,
        source: 'FAQ'
      };
    }
    
    // No FAQ found
    await this.faqService.logQuery(userRole, question);
    
    return {
      answer: "I'm sorry, I don't have an official answer in the COSTAATT documentation. Would you like me to forward this question to HR?",
      source: 'UNKNOWN'
    };
  }

  @Get('faqs')
  async getFAQs(
    @Query('role') role?: string,
    @CurrentUser() user: any
  ) {
    return this.faqService.getAllFAQs(role);
  }

  @Get('unanswered')
  async getUnansweredQuestions(@CurrentUser() user: any) {
    // Only HR can see unanswered questions
    if (user.role !== 'HR_ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.faqService.getUnansweredQuestions();
  }
}
