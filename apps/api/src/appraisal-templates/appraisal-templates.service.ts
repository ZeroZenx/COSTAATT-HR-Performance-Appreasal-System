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
    displayName?: string;
    type?: AppraisalTemplateType;
    version?: string;
    description?: string; // Frontend sends this, but it should be in configJson.metadata
    configJson?: ScoringConfig;
    published?: boolean;
    active?: boolean;
    templateStructure?: any;
    weighting?: any;
  }) {
    const template = await this.prisma.appraisalTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Appraisal template not found');
    }

    // Validate configJson if provided
    if (data.configJson) {
      try {
        const templateType = data.type || template.type;
        console.log('Validating configJson for type:', templateType);
        const configAny = data.configJson as any;
        const weightsSum = configAny.weights ? Object.values(configAny.weights).reduce((sum: number, w: any) => {
          const weight = typeof w === 'number' ? w : 0;
          return sum + weight;
        }, 0) : 0;
        
        console.log('ConfigJson structure:', {
          hasDenominators: !!configAny.denominators,
          hasWeights: !!configAny.weights,
          hasMaxScores: !!configAny.maxScores,
          hasSections: Array.isArray(configAny.sections),
          sectionsCount: Array.isArray(configAny.sections) ? configAny.sections.length : 0,
          weightsKeys: configAny.weights ? Object.keys(configAny.weights) : [],
          weightsSum: weightsSum,
        });
        
        // Only validate if configJson has required structure - be very lenient
        try {
          this.validateTemplateConfig(templateType as any, data.configJson);
          console.log('Validation passed');
        } catch (validationError: any) {
          console.warn('Validation warning (continuing anyway):', validationError.message);
          // For custom templates, don't fail on validation errors - just warn
          if (templateType !== 'GENERAL_STAFF' && templateType !== 'EXECUTIVE' && templateType !== 'EXECUTIVE_MANAGEMENT') {
            // Only fail for templates with required sections
            throw validationError;
          }
        }
      } catch (error) {
        console.error('Validation error:', error);
        // Re-throw validation errors with more context
        if (error instanceof BadRequestException) {
          throw new BadRequestException(`Template validation failed: ${error.message}`);
        }
        throw error;
      }
    }

    try {
      // Build update data with only valid Prisma fields
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.displayName !== undefined) updateData.displayName = data.displayName;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.version !== undefined) updateData.version = data.version;
      
      // Handle configJson - merge description into metadata if provided separately
      if (data.configJson !== undefined) {
        try {
          // Ensure configJson is properly formatted as a JSON object
          const configJson: any = typeof data.configJson === 'string' 
            ? JSON.parse(data.configJson) 
            : data.configJson;
          
          // If description is provided separately, merge it into configJson.metadata
          if (data.description !== undefined) {
            configJson.metadata = {
              ...(configJson.metadata || {}),
              description: data.description,
            };
          }
          
          // Validate that configJson is a valid object
          if (typeof configJson !== 'object' || configJson === null) {
            throw new BadRequestException('Invalid configJson format: must be an object');
          }
          
          updateData.configJson = configJson;
        } catch (parseError: any) {
          console.error('Error parsing/configuring configJson:', parseError);
          throw new BadRequestException(`Invalid configJson: ${parseError.message}`);
        }
      } else if (data.description !== undefined) {
        // If only description is provided without configJson, we need to preserve existing configJson
        try {
          const existingConfig: any = typeof template.configJson === 'string'
            ? JSON.parse(template.configJson as string)
            : (template.configJson as any) || {};
          
          updateData.configJson = {
            ...existingConfig,
            metadata: {
              ...(existingConfig.metadata || {}),
              description: data.description,
            },
          };
        } catch (parseError: any) {
          console.error('Error parsing existing configJson:', parseError);
          throw new BadRequestException(`Invalid existing configJson: ${parseError.message}`);
        }
      }
      
      if (data.published !== undefined) updateData.published = data.published;
      if (data.active !== undefined) updateData.active = data.active;
      
      // Handle templateStructure - ensure it's valid JSON
      if (data.templateStructure !== undefined) {
        try {
          updateData.templateStructure = typeof data.templateStructure === 'string'
            ? JSON.parse(data.templateStructure)
            : data.templateStructure;
        } catch (parseError: any) {
          console.error('Error parsing templateStructure:', parseError);
          throw new BadRequestException(`Invalid templateStructure: ${parseError.message}`);
        }
      }
      
      // Handle weighting - ensure it's valid JSON
      if (data.weighting !== undefined) {
        try {
          updateData.weighting = typeof data.weighting === 'string'
            ? JSON.parse(data.weighting)
            : data.weighting;
        } catch (parseError: any) {
          console.error('Error parsing weighting:', parseError);
          throw new BadRequestException(`Invalid weighting: ${parseError.message}`);
        }
      }

      console.log('Updating template with data:', JSON.stringify(updateData, null, 2));
      console.log('Template ID:', id);
      console.log('Update data keys:', Object.keys(updateData));

      // Ensure all JSON fields are properly formatted
      if (updateData.configJson && typeof updateData.configJson !== 'string') {
        updateData.configJson = updateData.configJson as any; // Prisma will handle JSON serialization
      }
      if (updateData.templateStructure && typeof updateData.templateStructure !== 'string') {
        updateData.templateStructure = updateData.templateStructure as any;
      }
      if (updateData.weighting && typeof updateData.weighting !== 'string') {
        updateData.weighting = updateData.weighting as any;
      }

      try {
        const result = await this.prisma.appraisalTemplate.update({
          where: { id },
          data: updateData,
        });
        
        console.log('Template updated successfully:', result.id);
        return result;
      } catch (prismaError: any) {
        console.error('Prisma update error:', prismaError);
        console.error('Prisma error code:', prismaError.code);
        console.error('Prisma error message:', prismaError.message);
        console.error('Prisma error meta:', prismaError.meta);
        throw prismaError;
      }
    } catch (error: any) {
      // Log the error for debugging
      console.error('Error updating template:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
        name: error.name,
        constructor: error.constructor?.name,
      });
      
      // Re-throw BadRequestException and NotFoundException as-is
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      // Provide more helpful error messages for Prisma errors
      if (error.code === 'P2002') {
        throw new BadRequestException('A template with this name already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Template not found');
      }
      
      // For other errors, provide a more descriptive message
      const errorMessage = error.message || 'Unknown error occurred';
      throw new BadRequestException(`Failed to update template: ${errorMessage}`);
    }
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
    if (!config) {
      throw new BadRequestException('Template configuration is required');
    }

    const requiredSections = this.getRequiredSections(type);
    const configAny = config as any;
    const hasCustomSections = Array.isArray(configAny.sections) && configAny.sections.length > 0;
    
    // Validate required sections for specific template types (DEAN, FACULTY, CLINICAL)
    for (const section of requiredSections) {
      if (!config.denominators?.[section] || config.denominators[section] <= 0) {
        throw new BadRequestException(`Invalid denominator for section ${section}`);
      }
      if (config.weights?.[section] === undefined || config.weights[section] < 0 || config.weights[section] > 1) {
        throw new BadRequestException(`Invalid weight for section ${section}`);
      }
      if (!config.maxScores?.[section] || config.maxScores[section] <= 0) {
        throw new BadRequestException(`Invalid max score for section ${section}`);
      }
    }

    // For templates with custom sections (GENERAL_STAFF, EXECUTIVE, etc.), 
    // validation is very lenient - allow sections even if weights structure is incomplete
    if (requiredSections.length === 0) {
      // For custom templates, if sections exist, validate structure but be lenient with weights
      if (hasCustomSections) {
        // Validate sections have basic structure
        for (const section of configAny.sections) {
          if (!section || typeof section !== 'object') {
            throw new BadRequestException('All sections must be valid objects');
          }
          // Basic validation - title should exist, weight should be a number if provided
          if (section.weight !== undefined && (typeof section.weight !== 'number' || section.weight < 0)) {
            throw new BadRequestException(`Invalid weight for section: ${section.title || 'unknown'}`);
          }
        }
        
        // Validate weights if they exist - be lenient with precision
        if (config.weights && Object.keys(config.weights).length > 0) {
          const totalWeight = Object.values(config.weights).reduce((sum: number, weight: any) => {
            const w = typeof weight === 'number' ? weight : 0;
            return sum + w;
          }, 0);
          // Very lenient precision check - allow up to 0.1 difference to account for calculation errors
          if (Math.abs(totalWeight - 1) > 0.1) {
            console.warn(`Weights sum is ${totalWeight.toFixed(4)}, expected ~1.0, but allowing due to custom sections`);
            // Don't throw error, just warn - weights will be normalized on save
          }
        }
        // If weights don't exist but sections do, that's OK - weights will be calculated
        return; // Skip further validation for custom sections
      }
    }
    
    // Validate that weights sum to 1 (only if there are weights defined and required sections)
    if (config.weights && Object.keys(config.weights).length > 0) {
      const totalWeight = Object.values(config.weights).reduce((sum: number, weight: any) => {
        const w = typeof weight === 'number' ? weight : 0;
        return sum + w;
      }, 0);
      // Use more lenient precision check (0.01 instead of 0.001) to account for floating point issues
      if (Math.abs(totalWeight - 1) > 0.01) {
        throw new BadRequestException(`Section weights must sum to approximately 1 (within 0.01), but got ${totalWeight.toFixed(4)}`);
      }
    } else if (requiredSections.length > 0) {
      // If there are required sections but no weights, that's an error
      throw new BadRequestException('Template configuration must include weights for required sections');
    }
    // For custom templates without required sections and without sections, that's OK
    // (they will use default configuration)
  }

  private getRequiredSections(type: AppraisalTemplateType): string[] {
    switch (type) {
      case AppraisalTemplateType.DEAN:
        return ['functional', 'core', 'projects'];
      case AppraisalTemplateType.FACULTY:
        return ['functional', 'core', 'studentEvaluations'];
      case AppraisalTemplateType.CLINICAL:
      case AppraisalTemplateType.CLINICAL_INSTRUCTOR:
        return ['functional', 'core', 'studentEvaluations'];
      case AppraisalTemplateType.GENERAL_STAFF:
      case AppraisalTemplateType.EXECUTIVE:
      case AppraisalTemplateType.EXECUTIVE_MANAGEMENT:
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

  async getAnalytics(id: string) {
    const template = await this.findById(id);
    
    const appraisals = template.appraisals || [];
    const totalAppraisals = appraisals.length;
    const completedAppraisals = appraisals.filter((a: any) => a.status === 'COMPLETED').length;
    const inProgressAppraisals = appraisals.filter((a: any) => a.status === 'IN_PROGRESS').length;
    
    // Calculate average scores if available
    const appraisalsWithScores = appraisals.filter((a: any) => a.overallScore != null);
    const averageScore = appraisalsWithScores.length > 0
      ? appraisalsWithScores.reduce((sum: number, a: any) => sum + (a.overallScore || 0), 0) / appraisalsWithScores.length
      : null;

    return {
      template: {
        id: template.id,
        name: template.name,
        displayName: template.displayName,
        type: template.type,
      },
      stats: {
        totalAppraisals,
        completedAppraisals,
        inProgressAppraisals,
        averageScore: averageScore ? Math.round(averageScore * 100) / 100 : null,
      },
      appraisals: appraisals.map((a: any) => ({
        id: a.id,
        employeeName: a.employee?.user ? `${a.employee.user.firstName} ${a.employee.user.lastName}` : 'Unknown',
        status: a.status,
        overallScore: a.overallScore,
        createdAt: a.createdAt,
      })),
    };
  }
}

