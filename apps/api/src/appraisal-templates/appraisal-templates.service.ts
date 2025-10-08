import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringConfig } from '@costaatt/shared';
import { AppraisalTemplateType } from '@prisma/client';

@Injectable()
export class AppraisalTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appraisalTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const template = await this.prisma.appraisalTemplate.findUnique({
      where: { id },
      include: {
        appraisals: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Appraisal template not found');
    }

    return template;
  }

  async findByType(type: AppraisalTemplateType) {
    return this.prisma.appraisalTemplate.findMany({
      where: { type: type as any },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: {
    name: string;
    type: AppraisalTemplateType;
    configJson: ScoringConfig;
  }) {
    // Validate configJson based on template type
    this.validateTemplateConfig(data.type, data.configJson);

    return this.prisma.appraisalTemplate.create({
      data: data as any,
    });
  }

  async update(id: string, data: {
    name?: string;
    configJson?: ScoringConfig;
  }) {
    const template = await this.prisma.appraisalTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Appraisal template not found');
    }

    // Validate configJson if provided
    if (data.configJson) {
      this.validateTemplateConfig(template.type as any, data.configJson);
    }

    return this.prisma.appraisalTemplate.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string) {
    const template = await this.prisma.appraisalTemplate.findUnique({
      where: { id },
      include: {
        appraisals: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Appraisal template not found');
    }

    // Check if template has appraisals
    if (template.appraisals.length > 0) {
      throw new BadRequestException('Cannot delete template with existing appraisals');
    }

    return this.prisma.appraisalTemplate.delete({
      where: { id },
    });
  }

  private validateTemplateConfig(type: AppraisalTemplateType, config: ScoringConfig) {
    const requiredSections = this.getRequiredSections(type);
    
    for (const section of requiredSections) {
      if (!config.denominators[section] || config.denominators[section] <= 0) {
        throw new BadRequestException(`Invalid denominator for section ${section}`);
      }
      if (!config.weights[section] || config.weights[section] < 0 || config.weights[section] > 1) {
        throw new BadRequestException(`Invalid weight for section ${section}`);
      }
      if (!config.maxScores[section] || config.maxScores[section] <= 0) {
        throw new BadRequestException(`Invalid max score for section ${section}`);
      }
    }

    // Validate that weights sum to 1
    const totalWeight = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1) > 0.001) {
      throw new BadRequestException('Section weights must sum to 1');
    }
  }

  private getRequiredSections(type: AppraisalTemplateType): string[] {
    switch (type) {
      case AppraisalTemplateType.DEAN:
        return ['functional', 'core', 'projects'];
      case AppraisalTemplateType.FACULTY:
        return ['functional', 'core', 'studentEvaluations'];
      case AppraisalTemplateType.CLINICAL:
        return ['functional', 'core', 'studentEvaluations'];
      case AppraisalTemplateType.GENERAL_STAFF:
      case AppraisalTemplateType.EXECUTIVE:
        return []; // Custom sections defined in configJson
      default:
        return [];
    }
  }

  async getDefaultTemplates() {
    const defaultTemplates = [
      {
        name: 'Dean Performance Appraisal',
        type: AppraisalTemplateType.DEAN,
        configJson: {
          denominators: {
            functional: 117,
            core: 99,
            projects: 12,
          },
          weights: {
            functional: 0.50,
            core: 0.30,
            projects: 0.20,
          },
          maxScores: {
            functional: 117,
            core: 99,
            projects: 12,
          },
        },
      },
      {
        name: 'Faculty Performance Appraisal',
        type: AppraisalTemplateType.FACULTY,
        configJson: {
          denominators: {
            functional: 114,
            core: 99,
            studentEvaluations: 50,
            projects: 12,
          },
          weights: {
            functional: 0.50,
            core: 0.30,
            studentEvaluations: 0.20,
            projects: 0.00,
          },
          maxScores: {
            functional: 114,
            core: 99,
            studentEvaluations: 50,
            projects: 12,
          },
        },
      },
      {
        name: 'Clinical Instructor Performance Appraisal',
        type: AppraisalTemplateType.CLINICAL,
        configJson: {
          denominators: {
            functional: 81,
            core: 72,
            studentEvaluations: 30,
          },
          weights: {
            functional: 0.60,
            core: 0.20,
            studentEvaluations: 0.20,
          },
          maxScores: {
            functional: 81,
            core: 72,
            studentEvaluations: 30,
          },
        },
      },
    ];

    return defaultTemplates;
  }

  async createDefaultTemplates() {
    const defaultTemplates = await this.getDefaultTemplates();
    const createdTemplates = [];

    for (const template of defaultTemplates) {
      const existing = await this.prisma.appraisalTemplate.findFirst({
        where: { type: template.type as any },
      });

      if (!existing) {
        const created = await this.prisma.appraisalTemplate.create({
          data: template as any,
        });
        createdTemplates.push(created);
      }
    }

    return createdTemplates;
  }
}

