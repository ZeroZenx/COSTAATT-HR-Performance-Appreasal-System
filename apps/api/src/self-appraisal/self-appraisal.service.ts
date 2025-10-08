import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SelfAppraisalStatus } from '@prisma/client';

export interface SelfAppraisalAnswers {
  q1_accomplishments: string;
  q2_improvements: string;
  q3_satisfaction: string;
  q4_obstacles: string;
  q5_roleChange: string;
  q6_training: string;
  q7_goals: string;
  q8_suggestions: string;
}

export interface SelfAppraisalRatings {
  clusterId: string;
  label: string;
  value: number;
}

export interface CreateSelfAppraisalDto {
  cycleId: string;
  employeeId: string;
  supervisorId?: string;
  dueDate: Date;
  interviewDate?: Date;
  interviewTime?: string;
}

export interface UpdateSelfAppraisalDto {
  answers?: Partial<SelfAppraisalAnswers>;
  selfRatings?: SelfAppraisalRatings[];
  interviewDate?: Date;
  interviewTime?: string;
}

export interface ReturnSelfAppraisalDto {
  reason: string;
  newDueDate?: Date;
}

@Injectable()
export class SelfAppraisalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Seed self-appraisal tasks for all active employees in a cycle
   */
  async seedSelfAppraisals(cycleId: string): Promise<{ created: number; skipped: number }> {

    // Get the cycle
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    // Get all active employees
    const employees = await this.prisma.user.findMany({
      where: { 
        active: true,
        employee: { isNot: null }
      },
      include: { employee: true }
    });

    let created = 0;
    let skipped = 0;

    for (const employee of employees) {
      // Check if self-appraisal already exists
      const existing = await this.prisma.selfAppraisal.findUnique({
        where: {
          cycleId_employeeId: {
            cycleId,
            employeeId: employee.id
          }
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Calculate due date (14 days before cycle end, or 21 days after cycle start)
      const dueDate = new Date(cycle.periodEnd);
      dueDate.setDate(dueDate.getDate() - 14);

      // Create self-appraisal
      await this.prisma.selfAppraisal.create({
        data: {
          cycleId,
          employeeId: employee.id,
          supervisorId: employee.managerId,
          dueDate,
          answers: this.getDefaultAnswers() as any,
          attachments: [] as any,
        }
      });

      created++;
    }

    return { created, skipped };
  }

  /**
   * Get user's self-appraisal for a specific cycle
   */
  async getMySelfAppraisal(employeeId: string, cycleId: string) {
    const selfAppraisal = await this.prisma.selfAppraisal.findUnique({
      where: {
        cycleId_employeeId: {
          cycleId,
          employeeId
        }
      },
      include: {
        cycle: true,
        employee: true,
        supervisor: true,
        attachments: true
      }
    });

    if (!selfAppraisal) {
      throw new NotFoundException('Self-appraisal not found');
    }

    return this.formatSelfAppraisalResponse(selfAppraisal);
  }

  /**
   * Get self-appraisal by ID (with access control)
   */
  async getSelfAppraisalById(id: string, userId: string, userRole: string) {
    const selfAppraisal = await this.prisma.selfAppraisal.findUnique({
      where: { id },
      include: {
        cycle: true,
        employee: true,
        supervisor: true,
        attachments: true
      }
    });

    if (!selfAppraisal) {
      throw new NotFoundException('Self-appraisal not found');
    }

    // Check access permissions
    await this.checkAccess(selfAppraisal, userId, userRole);

    return this.formatSelfAppraisalResponse(selfAppraisal);
  }

  /**
   * Update self-appraisal (employee only, while editable)
   */
  async updateSelfAppraisal(id: string, userId: string, data: UpdateSelfAppraisalDto) {
    const selfAppraisal = await this.prisma.selfAppraisal.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!selfAppraisal) {
      throw new NotFoundException('Self-appraisal not found');
    }

    // Check ownership
    if (selfAppraisal.employeeId !== userId) {
      throw new ForbiddenException('You can only edit your own self-appraisal');
    }

    // Check if editable
    if (!this.isEditable(selfAppraisal.status)) {
      throw new BadRequestException('Self-appraisal is not in an editable state');
    }

    // Update the self-appraisal
    const updated = await this.prisma.selfAppraisal.update({
      where: { id },
      data: {
        ...data,
        status: selfAppraisal.status === SelfAppraisalStatus.NOT_STARTED 
          ? SelfAppraisalStatus.IN_PROGRESS 
          : selfAppraisal.status,
        updatedAt: new Date(),
        selfRatings: data.selfRatings as any,
      },
      include: {
        cycle: true,
        employee: true,
        supervisor: true,
        attachments: true
      }
    });

    // Log audit trail
    await this.logAudit('UPDATE', userId, 'SelfAppraisal', id, {
      changes: data,
      previousStatus: selfAppraisal.status,
      newStatus: updated.status
    });

    return this.formatSelfAppraisalResponse(updated);
  }

  /**
   * Submit self-appraisal
   */
  async submitSelfAppraisal(id: string, userId: string) {
    const selfAppraisal = await this.prisma.selfAppraisal.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!selfAppraisal) {
      throw new NotFoundException('Self-appraisal not found');
    }

    // Check ownership
    if (selfAppraisal.employeeId !== userId) {
      throw new ForbiddenException('You can only submit your own self-appraisal');
    }

    // Check if can be submitted
    if (!this.isEditable(selfAppraisal.status)) {
      throw new BadRequestException('Self-appraisal cannot be submitted in current state');
    }

    // Validate required fields
      const answers = selfAppraisal.answers as any;
    const validationErrors = this.validateSubmission(answers);
    
    if (validationErrors.length > 0) {
      throw new BadRequestException(`Missing required fields: ${validationErrors.join(', ')}`);
    }

    // Submit the self-appraisal
    const updated = await this.prisma.selfAppraisal.update({
      where: { id },
      data: {
        status: SelfAppraisalStatus.SUBMITTED,
        submittedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        cycle: true,
        employee: true,
        supervisor: true,
        attachments: true
      }
    });

    // Log audit trail
    await this.logAudit('SUBMIT', userId, 'SelfAppraisal', id, {
      submittedAt: updated.submittedAt,
      previousStatus: selfAppraisal.status
    });

    return this.formatSelfAppraisalResponse(updated);
  }

  /**
   * Return self-appraisal for edits (supervisor/HR only)
   */
  async returnSelfAppraisal(id: string, userId: string, userRole: string, data: ReturnSelfAppraisalDto) {
    const selfAppraisal = await this.prisma.selfAppraisal.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!selfAppraisal) {
      throw new NotFoundException('Self-appraisal not found');
    }

    // Check permissions
    await this.checkAccess(selfAppraisal, userId, userRole);

    // Check if can be returned
    if (selfAppraisal.status !== SelfAppraisalStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted self-appraisals can be returned for edits');
    }

    // Return the self-appraisal
    const updated = await this.prisma.selfAppraisal.update({
      where: { id },
      data: {
        status: SelfAppraisalStatus.RETURNED_FOR_EDITS,
        returnedAt: new Date(),
        returnReason: data.reason,
        dueDate: data.newDueDate || selfAppraisal.dueDate,
        updatedAt: new Date()
      },
      include: {
        cycle: true,
        employee: true,
        supervisor: true,
        attachments: true
      }
    });

    // Log audit trail
    await this.logAudit('RETURN', userId, 'SelfAppraisal', id, {
      reason: data.reason,
      newDueDate: data.newDueDate,
      previousStatus: selfAppraisal.status
    });

    return this.formatSelfAppraisalResponse(updated);
  }

  /**
   * Lock self-appraisal to final (HR only)
   */
  async lockSelfAppraisal(id: string, userId: string) {
    const selfAppraisal = await this.prisma.selfAppraisal.findUnique({
      where: { id }
    });

    if (!selfAppraisal) {
      throw new NotFoundException('Self-appraisal not found');
    }

    // Lock the self-appraisal
    const updated = await this.prisma.selfAppraisal.update({
      where: { id },
      data: {
        status: SelfAppraisalStatus.LOCKED_TO_FINAL,
        lockedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        cycle: true,
        employee: true,
        supervisor: true,
        attachments: true
      }
    });

    // Log audit trail
    await this.logAudit('LOCK', userId, 'SelfAppraisal', id, {
      lockedAt: updated.lockedAt,
      previousStatus: selfAppraisal.status
    });

    return this.formatSelfAppraisalResponse(updated);
  }

  /**
   * Get self-appraisals for supervisor's team
   */
  async getTeamSelfAppraisals(supervisorId: string, cycleId?: string) {
    const whereClause: any = {
      supervisorId
    };

    if (cycleId) {
      whereClause.cycleId = cycleId;
    }

    const selfAppraisals = await this.prisma.selfAppraisal.findMany({
      where: whereClause,
      include: {
        cycle: true,
        employee: true,
        supervisor: true,
        attachments: true
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' }
      ]
    });

    return selfAppraisals.map(sa => this.formatSelfAppraisalResponse(sa));
  }

  /**
   * Get all self-appraisals (HR only)
   */
  async getAllSelfAppraisals(cycleId?: string, status?: SelfAppraisalStatus) {
    const whereClause: any = {};

    if (cycleId) {
      whereClause.cycleId = cycleId;
    }

    if (status) {
      whereClause.status = status;
    }

    const selfAppraisals = await this.prisma.selfAppraisal.findMany({
      where: whereClause,
      include: {
        cycle: true,
        employee: true,
        supervisor: true,
        attachments: true
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' }
      ]
    });

    return selfAppraisals.map(sa => this.formatSelfAppraisalResponse(sa));
  }

  /**
   * Get self-appraisal statistics
   */
  async getSelfAppraisalStats(cycleId?: string) {
    const whereClause = cycleId ? { cycleId } : {};

    const stats = await this.prisma.selfAppraisal.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    const total = await this.prisma.selfAppraisal.count({
      where: whereClause
    });

    const overdue = await this.prisma.selfAppraisal.count({
      where: {
        ...whereClause,
        dueDate: { lt: new Date() },
        status: { not: SelfAppraisalStatus.SUBMITTED }
      }
    });

    return {
      total,
      overdue,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Private helper methods
   */
  private getDefaultAnswers(): SelfAppraisalAnswers {
    return {
      q1_accomplishments: '',
      q2_improvements: '',
      q3_satisfaction: '',
      q4_obstacles: '',
      q5_roleChange: '',
      q6_training: '',
      q7_goals: '',
      q8_suggestions: ''
    };
  }

  private isEditable(status: SelfAppraisalStatus): boolean {
    return status === SelfAppraisalStatus.NOT_STARTED || 
           status === SelfAppraisalStatus.IN_PROGRESS || 
           status === SelfAppraisalStatus.RETURNED_FOR_EDITS;
  }

  private validateSubmission(answers: SelfAppraisalAnswers): string[] {
    const errors: string[] = [];
    const requiredFields = ['q1_accomplishments', 'q7_goals']; // Core required fields

    for (const field of requiredFields) {
      if (!answers[field] || answers[field].trim().length === 0) {
        errors.push(field.replace('q', 'Question ').replace('_', ' '));
      }
    }

    return errors;
  }

  private async checkAccess(selfAppraisal: any, userId: string, userRole: string) {
    // HR Admin has full access
    if (userRole === 'HR_ADMIN') {
      return;
    }

    // Employee can access their own
    if (selfAppraisal.employeeId === userId) {
      return;
    }

    // Supervisor can access their team's
    if (userRole === 'SUPERVISOR' && selfAppraisal.supervisorId === userId) {
      return;
    }

    throw new ForbiddenException('You do not have permission to access this self-appraisal');
  }

  private formatSelfAppraisalResponse(selfAppraisal: any) {
    return {
      id: selfAppraisal.id,
      cycleId: selfAppraisal.cycleId,
      employeeId: selfAppraisal.employeeId,
      supervisorId: selfAppraisal.supervisorId,
      status: selfAppraisal.status,
      dueDate: selfAppraisal.dueDate,
      interviewDate: selfAppraisal.interviewDate,
      interviewTime: selfAppraisal.interviewTime,
      answers: selfAppraisal.answers,
      selfRatings: selfAppraisal.selfRatings,
      submittedAt: selfAppraisal.submittedAt,
      returnedAt: selfAppraisal.returnedAt,
      lockedAt: selfAppraisal.lockedAt,
      returnReason: selfAppraisal.returnReason,
      createdAt: selfAppraisal.createdAt,
      updatedAt: selfAppraisal.updatedAt,
      employee: {
        id: selfAppraisal.employee.user.id,
        name: `${selfAppraisal.employee.user.firstName} ${selfAppraisal.employee.user.lastName}`,
        email: selfAppraisal.employee.user.email,
        dept: selfAppraisal.employee.user.dept,
        title: selfAppraisal.employee.user.title
      },
      supervisor: selfAppraisal.supervisor ? {
        id: selfAppraisal.supervisor.id,
        name: `${selfAppraisal.supervisor.firstName} ${selfAppraisal.supervisor.lastName}`,
        email: selfAppraisal.supervisor.email
      } : null,
      attachments: selfAppraisal.attachments || [],
      cycle: {
        id: selfAppraisal.cycle.id,
        name: selfAppraisal.cycle.name,
        periodStart: selfAppraisal.cycle.periodStart,
        periodEnd: selfAppraisal.cycle.periodEnd
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
