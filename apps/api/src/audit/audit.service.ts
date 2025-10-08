import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
  action: string;
  entity: string;
  entityId: string;
  actorId: string;
  description?: string;
  oldData?: any;
  newData?: any;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit event with comprehensive data
   */
  async log(data: AuditLogData) {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          actorId: data.actorId,
          description: data.description,
          oldData: data.oldData,
          newData: data.newData,
          ip: data.ip,
          userAgent: data.userAgent,
          metadata: data.metadata,
        },
      });

      this.logger.log(`Audit log created: ${data.action} on ${data.entity} by ${data.actorId}`);
      return auditLog;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Log user authentication events
   */
  async logAuth(action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_RESET', userId: string, ip?: string, userAgent?: string) {
    return this.log({
      action,
      entity: 'User',
      entityId: userId,
      actorId: userId,
      description: `User ${action.toLowerCase()}`,
      ip,
      userAgent,
    });
  }

  /**
   * Log user management events
   */
  async logUserManagement(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLE_CHANGE' | 'STATUS_CHANGE', targetUserId: string, actorId: string, oldData?: any, newData?: any, ip?: string) {
    return this.log({
      action,
      entity: 'User',
      entityId: targetUserId,
      actorId,
      description: `User ${action.toLowerCase()} by admin`,
      oldData,
      newData,
      ip,
    });
  }

  /**
   * Log appraisal cycle events
   */
  async logAppraisalCycle(action: 'CREATE' | 'UPDATE' | 'ACTIVATE' | 'CLOSE' | 'DELETE', cycleId: string, actorId: string, oldData?: any, newData?: any, ip?: string) {
    return this.log({
      action,
      entity: 'AppraisalCycle',
      entityId: cycleId,
      actorId,
      description: `Appraisal cycle ${action.toLowerCase()}`,
      oldData,
      newData,
      ip,
    });
  }

  /**
   * Log appraisal template events
   */
  async logAppraisalTemplate(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE', templateId: string, actorId: string, oldData?: any, newData?: any, ip?: string) {
    return this.log({
      action,
      entity: 'AppraisalTemplate',
      entityId: templateId,
      actorId,
      description: `Appraisal template ${action.toLowerCase()}`,
      oldData,
      newData,
      ip,
    });
  }

  /**
   * Log appraisal instance events
   */
  async logAppraisalInstance(action: 'CREATE' | 'UPDATE' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'FINALIZE', instanceId: string, actorId: string, oldData?: any, newData?: any, ip?: string) {
    return this.log({
      action,
      entity: 'AppraisalInstance',
      entityId: instanceId,
      actorId,
      description: `Appraisal instance ${action.toLowerCase()}`,
      oldData,
      newData,
      ip,
    });
  }

  /**
   * Log employee management events
   */
  async logEmployeeManagement(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT', employeeId: string, actorId: string, oldData?: any, newData?: any, ip?: string) {
    return this.log({
      action,
      entity: 'Employee',
      entityId: employeeId,
      actorId,
      description: `Employee ${action.toLowerCase()}`,
      oldData,
      newData,
      ip,
    });
  }

  /**
   * Log self-appraisal events
   */
  async logSelfAppraisal(action: 'CREATE' | 'UPDATE' | 'SUBMIT' | 'APPROVE' | 'REJECT', selfAppraisalId: string, actorId: string, oldData?: any, newData?: any, ip?: string) {
    return this.log({
      action,
      entity: 'SelfAppraisal',
      entityId: selfAppraisalId,
      actorId,
      description: `Self-appraisal ${action.toLowerCase()}`,
      oldData,
      newData,
      ip,
    });
  }

  /**
   * Log final review events
   */
  async logFinalReview(action: 'CREATE' | 'UPDATE' | 'SIGN' | 'FINALIZE', finalReviewId: string, actorId: string, oldData?: any, newData?: any, ip?: string) {
    return this.log({
      action,
      entity: 'FinalReview',
      entityId: finalReviewId,
      actorId,
      description: `Final review ${action.toLowerCase()}`,
      oldData,
      newData,
      ip,
    });
  }

  /**
   * Log system configuration changes
   */
  async logSystemConfig(action: 'UPDATE', configType: string, actorId: string, oldData?: any, newData?: any, ip?: string) {
    return this.log({
      action,
      entity: 'SystemConfig',
      entityId: configType,
      actorId,
      description: `System configuration ${action.toLowerCase()}: ${configType}`,
      oldData,
      newData,
      ip,
    });
  }

  /**
   * Log data import/export events
   */
  async logDataOperation(action: 'IMPORT' | 'EXPORT' | 'BACKUP' | 'RESTORE', operationType: string, actorId: string, metadata?: any, ip?: string) {
    return this.log({
      action,
      entity: 'DataOperation',
      entityId: operationType,
      actorId,
      description: `Data ${action.toLowerCase()}: ${operationType}`,
      metadata,
      ip,
    });
  }

  /**
   * Log security events
   */
  async logSecurity(action: 'UNAUTHORIZED_ACCESS' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY' | 'ACCOUNT_LOCKED', actorId: string, description: string, metadata?: any, ip?: string) {
    return this.log({
      action,
      entity: 'Security',
      entityId: actorId,
      actorId,
      description,
      metadata,
      ip,
    });
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(filters: {
    entity?: string;
    action?: string;
    actorId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters.entity) {
      where.entity = filters.entity;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }

    if (filters.dateFrom && filters.dateTo) {
      where.ts = {
        gte: filters.dateFrom,
        lte: filters.dateTo,
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { ts: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const [totalLogs, actionStats, entityStats] = await Promise.all([
      this.prisma.auditLog.count({
        where: { ts: { gte: startDate } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { ts: { gte: startDate } },
        _count: { action: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        where: { ts: { gte: startDate } },
        _count: { entity: true },
      }),
    ]);

    return {
      totalLogs,
      actionStats: actionStats.map(stat => ({
        action: stat.action,
        count: stat._count.action,
      })),
      entityStats: entityStats.map(stat => ({
        entity: stat.entity,
        count: stat._count.entity,
      })),
    };
  }
}

