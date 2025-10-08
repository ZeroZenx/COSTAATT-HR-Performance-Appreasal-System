import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  role: 'ALL' | 'EMPLOYEE' | 'SUPERVISOR' | 'HR_ADMIN';
  category: 'GENERAL' | 'SCORING' | 'WORKFLOW' | 'TEMPLATES' | 'TECHNICAL';
  actionButton?: {
    text: string;
    url: string;
    method?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FAQService {
  constructor(private prisma: PrismaService) {}

  async getAllFAQs(role?: string): Promise<FAQ[]> {
    const where = role && role !== 'ALL' 
      ? { 
          OR: [
            { role: 'ALL' },
            { role: role as any }
          ],
          isActive: true
        }
      : { isActive: true };

    return this.prisma.fAQ.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
  }

  async searchFAQs(query: string, role?: string): Promise<FAQ[]> {
    const where = {
      AND: [
        {
          OR: [
            { question: { contains: query, mode: 'insensitive' } },
            { answer: { contains: query, mode: 'insensitive' } }
          ]
        },
        role && role !== 'ALL' 
          ? { 
              OR: [
                { role: 'ALL' },
                { role: role as any }
              ]
            }
          : {}
      ],
      isActive: true
    };

    return this.prisma.fAQ.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
  }

  async createFAQ(faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ> {
    return this.prisma.fAQ.create({
      data: {
        ...faq,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async updateFAQ(id: string, faq: Partial<FAQ>): Promise<FAQ> {
    return this.prisma.fAQ.update({
      where: { id },
      data: {
        ...faq,
        updatedAt: new Date()
      }
    });
  }

  async deleteFAQ(id: string): Promise<void> {
    await this.prisma.fAQ.delete({
      where: { id }
    });
  }

  async logQuery(userRole: string, question: string, faqId?: string, actionClicked?: string): Promise<void> {
    await this.prisma.chatbotQuery.create({
      data: {
        userRole,
        question,
        faqId,
        actionClicked,
        timestamp: new Date()
      }
    });
  }

  async getUnansweredQuestions(): Promise<any[]> {
    return this.prisma.chatbotQuery.findMany({
      where: { faqId: null },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
  }
}
