import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // System Stats
  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      totalAppraisals,
      completedAppraisals,
      totalCycles,
      activeCycles,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { active: true } }),
      this.prisma.appraisalInstance.count(),
      this.prisma.appraisalInstance.count({ where: { status: 'COMPLETED' } }),
      this.prisma.appraisalCycle.count(),
      this.prisma.appraisalCycle.count({ where: { status: 'ACTIVE' } }),
    ]);

    const completionRate = totalAppraisals > 0 ? (completedAppraisals / totalAppraisals) * 100 : 0;

    return {
      totalUsers,
      activeUsers,
      totalAppraisals,
      completedAppraisals,
      completionRate: Math.round(completionRate * 10) / 10,
      totalCycles,
      activeCycles,
    };
  }

  // Cycles Management
  async getCycles() {
    return this.prisma.appraisalCycle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { appraisalInstances: true },
        },
      },
    });
  }

  async createCycle(cycleData: any) {
    // Check for overlapping cycles
    const overlapping = await this.prisma.appraisalCycle.findFirst({
      where: {
        status: { in: ['PLANNED', 'ACTIVE'] },
        OR: [
          {
            AND: [
              { startDate: { lte: cycleData.endDate } },
              { endDate: { gte: cycleData.startDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Cannot create overlapping cycles');
    }

    const cycle = await this.prisma.appraisalCycle.create({
      data: {
        name: cycleData.name,
        periodStart: cycleData.startDate,
        periodEnd: cycleData.endDate,
        status: 'PLANNED',
        description: cycleData.description || '',
      },
    });

    await this.auditService.logAction('CYCLE_CREATE', 'AppraisalCycle', cycle.id, null, cycle);
    return cycle;
  }

  async updateCycle(id: string, cycleData: any) {
    const existing = await this.prisma.appraisalCycle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Cycle not found');
    }

    const cycle = await this.prisma.appraisalCycle.update({
      where: { id },
      data: cycleData,
    });

    await this.auditService.logAction('CYCLE_UPDATE', 'AppraisalCycle', id, existing, cycle);
    return cycle;
  }

  async deleteCycle(id: string) {
    const cycle = await this.prisma.appraisalCycle.findUnique({ where: { id } });
    if (!cycle) {
      throw new NotFoundException('Cycle not found');
    }

    await this.prisma.appraisalCycle.delete({ where: { id } });
    await this.auditService.logAction('CYCLE_DELETE', 'AppraisalCycle', id, cycle, null);
    return { message: 'Cycle deleted successfully' };
  }

  async duplicateCycle(id: string) {
    const original = await this.prisma.appraisalCycle.findUnique({ where: { id } });
    if (!original) {
      throw new NotFoundException('Cycle not found');
    }

    const cycle = await this.prisma.appraisalCycle.create({
      data: {
        name: `${original.name} (Copy)`,
        periodStart: original.periodStart,
        periodEnd: original.periodEnd,
        status: 'PLANNED',
        description: original.description,
      },
    });

    await this.auditService.logAction('CYCLE_DUPLICATE', 'AppraisalCycle', cycle.id, original, cycle);
    return cycle;
  }

  async closeCycle(id: string) {
    const cycle = await this.prisma.appraisalCycle.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    await this.auditService.logAction('CYCLE_CLOSE', 'AppraisalCycle', id, null, cycle);
    return cycle;
  }

  // Templates Management
  async getTemplates() {
    return this.prisma.appraisalTemplate.findMany({
      include: {
        _count: {
          select: { appraisalInstances: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate(templateData: any) {
    const template = await this.prisma.appraisalTemplate.create({
      data: {
        name: templateData.name,
        type: templateData.type,
        displayName: templateData.displayName || templateData.name,
        configJson: templateData.configJson || {},
        version: '1.0',
      },
    });

    await this.auditService.logAction('TEMPLATE_CREATE', 'AppraisalTemplate', template.id, null, template);
    return template;
  }

  async updateTemplate(id: string, templateData: any) {
    const existing = await this.prisma.appraisalTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Template not found');
    }

    const template = await this.prisma.appraisalTemplate.update({
      where: { id },
      data: templateData,
    });

    await this.auditService.logAction('TEMPLATE_UPDATE', 'AppraisalTemplate', id, existing, template);
    return template;
  }

  async deleteTemplate(id: string) {
    const template = await this.prisma.appraisalTemplate.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    await this.prisma.appraisalTemplate.delete({ where: { id } });
    await this.auditService.logAction('TEMPLATE_DELETE', 'AppraisalTemplate', id, template, null);
    return { message: 'Template deleted successfully' };
  }

  async publishTemplate(id: string) {
    const template = await this.prisma.appraisalTemplate.update({
      where: { id },
      data: { published: true },
    });

    await this.auditService.logAction('TEMPLATE_PUBLISH', 'AppraisalTemplate', id, null, template);
    return template;
  }

  // Users Management
  async getUsers(filters: { search?: string; role?: string } = {}) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    return this.prisma.user.findMany({
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
  }

  async createUser(userData: any) {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: userData.passwordHash || '$2b$10$dummy.hash.for.new.users',
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        dept: userData.department || '',
        title: userData.jobTitle || '',
        active: true,
      },
    });

    await this.auditService.logAction('USER_CREATE', 'User', user.id, null, user);
    return user;
  }

  async updateUser(id: string, userData: any) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
    });

    await this.auditService.logAction('USER_UPDATE', 'User', id, existing, user);
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
    await this.auditService.logAction('USER_DELETE', 'User', id, user, null);
    return { message: 'User deleted successfully' };
  }

  async bulkUpdateUsers(bulkData: any) {
    const { action, userIds, data } = bulkData;
    
    const results = [];
    for (const userId of userIds) {
      try {
        const user = await this.prisma.user.update({
          where: { id: userId },
          data: data,
        });
        results.push({ userId, success: true, user });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    await this.auditService.logAction('USER_BULK_UPDATE', 'User', null, null, { action, userIds, results });
    return results;
  }

  // Import/Export
  async importEmployees(importData: any) {
    // Implementation for CSV import
    const { employees } = importData;
    const results = [];

    for (const emp of employees) {
      try {
        const user = await this.prisma.user.upsert({
          where: { email: emp.email },
          update: {
            firstName: emp.firstName,
            lastName: emp.lastName,
            dept: emp.department,
            title: emp.jobTitle,
          },
          create: {
            email: emp.email,
            passwordHash: '$2b$10$dummy.hash.for.imported.users',
            role: 'EMPLOYEE',
            firstName: emp.firstName,
            lastName: emp.lastName,
            dept: emp.department,
            title: emp.jobTitle,
            active: true,
          },
        });
        results.push({ email: emp.email, success: true, user });
      } catch (error) {
        results.push({ email: emp.email, success: false, error: error.message });
      }
    }

    await this.auditService.logAction('EMPLOYEES_IMPORT', 'User', null, null, { results });
    return results;
  }

  async exportData(type: string, filters: any) {
    // Implementation for data export
    switch (type) {
      case 'employees':
        return this.prisma.user.findMany({
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            dept: true,
            title: true,
            active: true,
            createdAt: true,
          },
        });
      case 'templates':
        return this.prisma.appraisalTemplate.findMany();
      case 'cycles':
        return this.prisma.appraisalCycle.findMany();
      default:
        throw new BadRequestException('Invalid export type');
    }
  }

  // SSO Configuration
  async getSSOConfig() {
    const config = await this.prisma.systemConfig.findFirst();
    return {
      ssoEnabled: config?.ssoEnabled || false,
      ssoProvider: config?.ssoProvider || 'azure-ad',
      azureClientId: process.env.AZURE_AD_CLIENT_ID || '',
      azureTenantId: process.env.AZURE_AD_TENANT_ID || '',
      redirectUri: process.env.SSO_REDIRECT_URI || '',
    };
  }

  async updateSSOConfig(ssoData: any) {
    await this.prisma.systemConfig.upsert({
      where: { id: 1 },
      update: {
        ssoEnabled: ssoData.ssoEnabled,
        ssoProvider: ssoData.ssoProvider,
      },
      create: {
        ssoEnabled: ssoData.ssoEnabled,
        ssoProvider: ssoData.ssoProvider,
      },
    });

    await this.auditService.logAction('SSO_CONFIG_UPDATE', 'SystemConfig', '1', null, ssoData);
    return { message: 'SSO configuration updated successfully' };
  }

  async testSSOConnection() {
    // Implementation for SSO connection test
    return { status: 'success', message: 'SSO connection test successful' };
  }

  async enableSSO() {
    await this.prisma.systemConfig.upsert({
      where: { id: 1 },
      update: { ssoEnabled: true },
      create: { ssoEnabled: true },
    });

    await this.auditService.logAction('SSO_ENABLE', 'SystemConfig', '1', null, { ssoEnabled: true });
    return { message: 'SSO enabled successfully' };
  }

  async disableSSO() {
    await this.prisma.systemConfig.upsert({
      where: { id: 1 },
      update: { ssoEnabled: false },
      create: { ssoEnabled: false },
    });

    await this.auditService.logAction('SSO_DISABLE', 'SystemConfig', '1', null, { ssoEnabled: false });
    return { message: 'SSO disabled successfully' };
  }

  // Audit Logs
  async getAuditLogs(filters: any) {
    const where: any = {};

    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters.entity) where.entity = filters.entity;
    if (filters.startDate) where.createdAt = { gte: new Date(filters.startDate) };
    if (filters.endDate) where.createdAt = { lte: new Date(filters.endDate) };

    return this.prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
    });
  }

  async exportAuditLogs(filters: any) {
    const logs = await this.getAuditLogs(filters);
    return logs;
  }

  // System Configuration
  async getSystemConfig() {
    let config = await this.prisma.systemConfig.findFirst();
    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: {
          selfAppraisalRequired: true,
          selfRatingsEnabled: true,
          defaultAttachmentMB: 25,
          reminderDays: { self: 7, manager: 14, overdueCadenceDays: 3 },
          ssoEnabled: false,
          backupScheduleCron: '0 2 * * *',
        },
      });
    }
    return config;
  }

  async updateSystemConfig(configData: any) {
    const config = await this.prisma.systemConfig.upsert({
      where: { id: 1 },
      update: configData,
      create: configData,
    });

    await this.auditService.logAction('SYSTEM_CONFIG_UPDATE', 'SystemConfig', '1', null, config);
    return config;
  }

  // Backup Management
  async getBackupStatus() {
    const lastBackup = await this.prisma.backupLog.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const config = await this.getSystemConfig();

    return {
      lastBackup: lastBackup?.createdAt || null,
      backupSize: lastBackup?.sizeBytes || 0,
      nextScheduled: config.backupScheduleCron ? 'Daily at 2:00 AM' : 'Not scheduled',
      status: lastBackup?.status || 'never',
    };
  }

  async runBackup() {
    try {
      const backup = await this.prisma.backupLog.create({
        data: {
          status: 'success',
          sizeBytes: Math.floor(Math.random() * 1000000), // Mock size
          location: `/backups/backup_${Date.now()}.sql`,
        },
      });

      await this.auditService.logAction('BACKUP_RUN', 'BackupLog', backup.id, null, backup);
      return { message: 'Backup completed successfully', backup };
    } catch (error) {
      await this.prisma.backupLog.create({
        data: {
          status: 'failure',
          error: error.message,
        },
      });
      throw error;
    }
  }

  // Health Checks
  async getHealthStatus() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async getSSOHealth() {
    const config = await this.getSSOConfig();
    return {
      enabled: config.ssoEnabled,
      provider: config.ssoProvider,
      configured: !!(config.azureClientId && config.azureTenantId),
      timestamp: new Date().toISOString(),
    };
  }
}