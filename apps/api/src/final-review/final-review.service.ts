import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationType, RecommendationAction } from '@prisma/client';

export interface FinalReviewDto {
  employeeComments?: string;
  employeeSignature?: string;
  supervisorComments?: string;
  supervisorSignature?: string;
  divisionalComments?: string;
  divisionalHeadSignature?: string;
  recommendationType?: RecommendationType;
  recommendationAction?: RecommendationAction;
  additionalNotes?: string;
}

export interface SignatureDto {
  signature: string; // base64 image
  comments?: string;
}

export interface RecommendationDto {
  recommendationType: RecommendationType;
  recommendationAction: RecommendationAction;
  additionalNotes?: string;
  divisionalComments?: string;
  divisionalHeadSignature?: string;
}

@Injectable()
export class FinalReviewService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get final review for an appraisal
   */
  async getFinalReview(appraisalId: string, userId: string, userRole: string) {
    const finalReview = await this.prisma.finalReview.findUnique({
      where: { appraisalId },
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            },
            template: true,
            cycle: true
          }
        },
        employeeSigner: true,
        supervisorSigner: true,
        divisionalSigner: true,
        hrFinalizer: true
      }
    });

    if (!finalReview) {
      throw new NotFoundException('Final review not found');
    }

    // Check access permissions
    await this.checkAccess(finalReview, userId, userRole);

    return this.formatFinalReviewResponse(finalReview);
  }

  /**
   * Create or update final review
   */
  async createOrUpdateFinalReview(appraisalId: string, userId: string, userRole: string, data: FinalReviewDto) {
    // Check if appraisal exists and user has access
    const appraisal = await this.prisma.appraisalInstance.findUnique({
      where: { id: appraisalId },
      include: {
        employee: {
          include: { user: true }
        }
      }
    });

    if (!appraisal) {
      throw new NotFoundException('Appraisal not found');
    }

    // Check access permissions
    await this.checkAppraisalAccess(appraisal, userId, userRole);

    // Check if final review is locked
    const existingReview = await this.prisma.finalReview.findUnique({
      where: { appraisalId }
    });

    if (existingReview?.isLocked) {
      throw new BadRequestException('Final review is locked and cannot be modified');
    }

    // Create or update final review
    const finalReview = await this.prisma.finalReview.upsert({
      where: { appraisalId },
      create: {
        appraisalId,
        ...data
      },
      update: data,
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            },
            template: true,
            cycle: true
          }
        },
        employeeSigner: true,
        supervisorSigner: true,
        divisionalSigner: true,
        hrFinalizer: true
      }
    });

    // Log audit trail
    await this.logAudit('UPDATE', userId, 'FinalReview', finalReview.id, {
      appraisalId,
      changes: data
    });

    return this.formatFinalReviewResponse(finalReview);
  }

  /**
   * Employee signs final review
   */
  async employeeSign(appraisalId: string, userId: string, data: SignatureDto) {
    const finalReview = await this.getFinalReviewForSigning(appraisalId, userId, 'EMPLOYEE');

    // Check if already signed
    if (finalReview.employeeSignedAt) {
      throw new BadRequestException('Employee has already signed this review');
    }

    const updated = await this.prisma.finalReview.update({
      where: { appraisalId },
      data: {
        employeeComments: data.comments || finalReview.employeeComments,
        employeeSignature: data.signature,
        employeeSignedAt: new Date(),
        employeeSignedBy: userId
      },
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            },
            template: true,
            cycle: true
          }
        },
        employeeSigner: true,
        supervisorSigner: true,
        divisionalSigner: true,
        hrFinalizer: true
      }
    });

    // Log audit trail
    await this.logAudit('SIGN_EMPLOYEE', userId, 'FinalReview', updated.id, {
      appraisalId,
      signedAt: updated.employeeSignedAt
    });

    return this.formatFinalReviewResponse(updated);
  }

  /**
   * Supervisor signs final review
   */
  async supervisorSign(appraisalId: string, userId: string, data: SignatureDto) {
    const finalReview = await this.getFinalReviewForSigning(appraisalId, userId, 'SUPERVISOR');

    // Check if already signed
    if (finalReview.supervisorSignedAt) {
      throw new BadRequestException('Supervisor has already signed this review');
    }

    const updated = await this.prisma.finalReview.update({
      where: { appraisalId },
      data: {
        supervisorComments: data.comments || finalReview.supervisorComments,
        supervisorSignature: data.signature,
        supervisorSignedAt: new Date(),
        supervisorSignedBy: userId
      },
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            },
            template: true,
            cycle: true
          }
        },
        employeeSigner: true,
        supervisorSigner: true,
        divisionalSigner: true,
        hrFinalizer: true
      }
    });

    // Log audit trail
    await this.logAudit('SIGN_SUPERVISOR', userId, 'FinalReview', updated.id, {
      appraisalId,
      signedAt: updated.supervisorSignedAt
    });

    return this.formatFinalReviewResponse(updated);
  }

  /**
   * Divisional head signs final review
   */
  async divisionalSign(appraisalId: string, userId: string, data: RecommendationDto) {
    const finalReview = await this.getFinalReviewForSigning(appraisalId, userId, 'DIVISIONAL');

    // Check if already signed
    if (finalReview.divisionalHeadSignedAt) {
      throw new BadRequestException('Divisional head has already signed this review');
    }

    const updated = await this.prisma.finalReview.update({
      where: { appraisalId },
      data: {
        divisionalComments: data.divisionalComments || finalReview.divisionalComments,
        divisionalHeadSignature: data.divisionalHeadSignature,
        divisionalHeadSignedAt: new Date(),
        divisionalHeadSignedBy: userId,
        recommendationType: data.recommendationType,
        recommendationAction: data.recommendationAction,
        additionalNotes: data.additionalNotes
      },
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            },
            template: true,
            cycle: true
          }
        },
        employeeSigner: true,
        supervisorSigner: true,
        divisionalSigner: true,
        hrFinalizer: true
      }
    });

    // Log audit trail
    await this.logAudit('SIGN_DIVISIONAL', userId, 'FinalReview', updated.id, {
      appraisalId,
      signedAt: updated.divisionalHeadSignedAt,
      recommendation: {
        type: data.recommendationType,
        action: data.recommendationAction
      }
    });

    return this.formatFinalReviewResponse(updated);
  }

  /**
   * HR finalizes the review
   */
  async hrFinalize(appraisalId: string, userId: string) {
    const finalReview = await this.prisma.finalReview.findUnique({
      where: { appraisalId },
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!finalReview) {
      throw new NotFoundException('Final review not found');
    }

    // Check if already finalized
    if (finalReview.isLocked) {
      throw new BadRequestException('Final review is already locked');
    }

    // Validate required signatures (configurable)
    const settings = await this.getSettings();
    const validationErrors = this.validateRequiredSignatures(finalReview, settings);
    
    if (validationErrors.length > 0) {
      throw new BadRequestException(`Cannot finalize: ${validationErrors.join(', ')}`);
    }

    // Lock the final review
    const updated = await this.prisma.finalReview.update({
      where: { appraisalId },
      data: {
        isLocked: true,
        hrFinalizedBy: userId,
        hrFinalizedAt: new Date()
      },
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            },
            template: true,
            cycle: true
          }
        },
        employeeSigner: true,
        supervisorSigner: true,
        divisionalSigner: true,
        hrFinalizer: true
      }
    });

    // Update appraisal status to FINAL
    await this.prisma.appraisalInstance.update({
      where: { id: appraisalId },
      data: { status: 'FINAL' }
    });

    // Log audit trail
    await this.logAudit('FINALIZE', userId, 'FinalReview', updated.id, {
      appraisalId,
      finalizedAt: updated.hrFinalizedAt
    });

    return this.formatFinalReviewResponse(updated);
  }

  /**
   * Get final reviews for team (supervisor view)
   */
  async getTeamFinalReviews(supervisorId: string, cycleId?: string) {
    const whereClause: any = {
      appraisal: {
        employee: {
          user: {
            managerId: supervisorId
          }
        }
      }
    };

    if (cycleId) {
      whereClause.appraisal.cycleId = cycleId;
    }

    const finalReviews = await this.prisma.finalReview.findMany({
      where: whereClause,
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            },
            template: true,
            cycle: true
          }
        },
        employeeSigner: true,
        supervisorSigner: true,
        divisionalSigner: true,
        hrFinalizer: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return finalReviews.map(review => this.formatFinalReviewResponse(review));
  }

  /**
   * Get all final reviews (HR view)
   */
  async getAllFinalReviews(cycleId?: string, status?: string) {
    const whereClause: any = {};

    if (cycleId) {
      whereClause.appraisal = { cycleId };
    }

    if (status === 'locked') {
      whereClause.isLocked = true;
    } else if (status === 'pending') {
      whereClause.isLocked = false;
    }

    const finalReviews = await this.prisma.finalReview.findMany({
      where: whereClause,
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            },
            template: true,
            cycle: true
          }
        },
        employeeSigner: true,
        supervisorSigner: true,
        divisionalSigner: true,
        hrFinalizer: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return finalReviews.map(review => this.formatFinalReviewResponse(review));
  }

  /**
   * Get final review statistics
   */
  async getFinalReviewStats(cycleId?: string) {
    const whereClause = cycleId ? { appraisal: { cycleId } } : {};

    const stats = await this.prisma.finalReview.groupBy({
      by: ['isLocked', 'recommendationAction'],
      where: whereClause,
      _count: { id: true }
    });

    const total = await this.prisma.finalReview.count({
      where: whereClause
    });

    const locked = await this.prisma.finalReview.count({
      where: { ...whereClause, isLocked: true }
    });

    const pending = total - locked;

    return {
      total,
      locked,
      pending,
      byRecommendation: stats.reduce((acc, stat) => {
        const key = `${stat.isLocked ? 'locked' : 'pending'}_${stat.recommendationAction || 'none'}`;
        acc[key] = stat._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Private helper methods
   */
  private async getFinalReviewForSigning(appraisalId: string, userId: string, role: string) {
    const finalReview = await this.prisma.finalReview.findUnique({
      where: { appraisalId },
      include: {
        appraisal: {
          include: {
            employee: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!finalReview) {
      throw new NotFoundException('Final review not found');
    }

    // Check access permissions
    await this.checkAppraisalAccess(finalReview.appraisal, userId, role);

    return finalReview;
  }

  private async checkAccess(finalReview: any, userId: string, userRole: string) {
    const appraisal = finalReview.appraisal;
    
    // HR Admin has full access
    if (userRole === 'HR_ADMIN') {
      return;
    }

    // Employee can access their own
    if (appraisal.employee.userId === userId) {
      return;
    }

    // Supervisor can access their team's
    if (userRole === 'SUPERVISOR' && appraisal.employee.user.managerId === userId) {
      return;
    }

    throw new ForbiddenException('You do not have permission to access this final review');
  }

  private async checkAppraisalAccess(appraisal: any, userId: string, role: string) {
    // HR Admin has full access
    if (role === 'HR_ADMIN') {
      return;
    }

    // Employee can access their own
    if (appraisal.employee.userId === userId) {
      return;
    }

    // Supervisor can access their team's
    if (role === 'SUPERVISOR' && appraisal.employee.user.managerId === userId) {
      return;
    }

    throw new ForbiddenException('You do not have permission to access this appraisal');
  }

  private async getSettings() {
    // TODO: Implement settings retrieval
    return {
      requireEmployeeSignature: true,
      requireSupervisorSignature: true,
      requireDivisionalSignature: true,
      allowHROverride: false
    };
  }

  private validateRequiredSignatures(finalReview: any, settings: any): string[] {
    const errors: string[] = [];

    if (settings.requireEmployeeSignature && !finalReview.employeeSignedAt) {
      errors.push('Employee signature required');
    }

    if (settings.requireSupervisorSignature && !finalReview.supervisorSignedAt) {
      errors.push('Supervisor signature required');
    }

    if (settings.requireDivisionalSignature && !finalReview.divisionalHeadSignedAt) {
      errors.push('Divisional head signature required');
    }

    return errors;
  }

  private formatFinalReviewResponse(finalReview: any) {
    return {
      id: finalReview.id,
      appraisalId: finalReview.appraisalId,
      employeeComments: finalReview.employeeComments,
      employeeSignature: finalReview.employeeSignature,
      employeeSignedAt: finalReview.employeeSignedAt,
      employeeSigner: finalReview.employeeSigner ? {
        id: finalReview.employeeSigner.id,
        name: `${finalReview.employeeSigner.firstName} ${finalReview.employeeSigner.lastName}`,
        email: finalReview.employeeSigner.email
      } : null,
      supervisorComments: finalReview.supervisorComments,
      supervisorSignature: finalReview.supervisorSignature,
      supervisorSignedAt: finalReview.supervisorSignedAt,
      supervisorSigner: finalReview.supervisorSigner ? {
        id: finalReview.supervisorSigner.id,
        name: `${finalReview.supervisorSigner.firstName} ${finalReview.supervisorSigner.lastName}`,
        email: finalReview.supervisorSigner.email
      } : null,
      divisionalComments: finalReview.divisionalComments,
      divisionalHeadSignature: finalReview.divisionalHeadSignature,
      divisionalHeadSignedAt: finalReview.divisionalHeadSignedAt,
      divisionalSigner: finalReview.divisionalSigner ? {
        id: finalReview.divisionalSigner.id,
        name: `${finalReview.divisionalSigner.firstName} ${finalReview.divisionalSigner.lastName}`,
        email: finalReview.divisionalSigner.email
      } : null,
      recommendationType: finalReview.recommendationType,
      recommendationAction: finalReview.recommendationAction,
      additionalNotes: finalReview.additionalNotes,
      hrFinalizedBy: finalReview.hrFinalizedBy,
      hrFinalizedAt: finalReview.hrFinalizedAt,
      isLocked: finalReview.isLocked,
      createdAt: finalReview.createdAt,
      updatedAt: finalReview.updatedAt,
      appraisal: {
        id: finalReview.appraisal.id,
        employee: {
          id: finalReview.appraisal.employee.user.id,
          name: `${finalReview.appraisal.employee.user.firstName} ${finalReview.appraisal.employee.user.lastName}`,
          email: finalReview.appraisal.employee.user.email,
          dept: finalReview.appraisal.employee.user.dept,
          title: finalReview.appraisal.employee.user.title
        },
        template: {
          id: finalReview.appraisal.template.id,
          name: finalReview.appraisal.template.name,
          displayName: finalReview.appraisal.template.displayName
        },
        cycle: {
          id: finalReview.appraisal.cycle.id,
          name: finalReview.appraisal.cycle.name
        }
      }
    };
  }

  private async logAudit(action: string, userId: string, entity: string, entityId: string, meta: any) {
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action,
        entity,
        entityId,
        metaJson: meta,
        ip: '127.0.0.1' // TODO: Get real IP
      }
    });
  }
}
