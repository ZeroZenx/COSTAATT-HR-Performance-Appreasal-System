import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupervisorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Build recursive supervisor hierarchy
   * This creates entries for all direct and indirect reports
   */
  async buildSupervisorHierarchy() {
    
    // Clear existing hierarchy
    await this.prisma.supervisorScope.deleteMany({});
    
    // Get all users with their manager relationships
    const users = await this.prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    const hierarchyEntries = [];
    let processedCount = 0;

    // For each user, find all their supervisors (direct and indirect)
    for (const user of users) {
      const supervisors = await this.findAllSupervisors(user.id, users);
      
      for (const supervisor of supervisors) {
        hierarchyEntries.push({
          supervisorId: supervisor.id,
          reportId: user.id,
          level: supervisor.level,
        });
      }
      
      processedCount++;
      if (processedCount % 100 === 0) {
      }
    }

    // Batch insert all hierarchy entries
    if (hierarchyEntries.length > 0) {
      await this.prisma.supervisorScope.createMany({
        data: hierarchyEntries,
        skipDuplicates: true,
      });
    }

    return hierarchyEntries.length;
  }

  /**
   * Find all supervisors for a given user (recursive)
   */
  private async findAllSupervisors(userId: string, users: any[], level = 1): Promise<Array<{id: string, level: number}>> {
    const supervisors = [];
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.managerId) {
      return supervisors;
    }

    // Add direct manager
    supervisors.push({
      id: user.managerId,
      level: level
    });

    // Recursively find indirect managers
    const indirectSupervisors = await this.findAllSupervisors(user.managerId, users, level + 1);
    supervisors.push(...indirectSupervisors);

    return supervisors;
  }

  /**
   * Get all direct and indirect reports for a supervisor
   */
  async getSupervisorReports(supervisorId: string, includeIndirect = true) {
    const whereClause = includeIndirect 
      ? { supervisorId }
      : { supervisorId, level: 1 };

    return this.prisma.supervisorScope.findMany({
      where: whereClause,
      include: {
        report: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            division: true,
            title: true,
            active: true,
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { report: { firstName: 'asc' } }
      ]
    });
  }

  /**
   * Get supervisor hierarchy for a specific user
   */
  async getUserSupervisors(userId: string) {
    return this.prisma.supervisorScope.findMany({
      where: { reportId: userId },
      include: {
        supervisor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            division: true,
            title: true,
          }
        }
      },
      orderBy: { level: 'asc' }
    });
  }

  /**
   * Check if user A supervises user B (direct or indirect)
   */
  async isSupervisor(supervisorId: string, reportId: string): Promise<boolean> {
    const relationship = await this.prisma.supervisorScope.findFirst({
      where: {
        supervisorId,
        reportId
      }
    });

    return !!relationship;
  }

  /**
   * Get supervisor statistics
   */
  async getSupervisorStats() {
    const stats = await this.prisma.supervisorScope.groupBy({
      by: ['supervisorId'],
      _count: {
        reportId: true
      },
      where: {
        level: 1 // Only direct reports
      }
    });

    return {
      totalSupervisors: stats.length,
      totalDirectReports: stats.reduce((sum, stat) => sum + stat._count.reportId, 0),
      averageReportsPerSupervisor: stats.length > 0 
        ? stats.reduce((sum, stat) => sum + stat._count.reportId, 0) / stats.length 
        : 0
    };
  }

  /**
   * Rebuild hierarchy for a specific supervisor and their reports
   */
  async rebuildSupervisorHierarchy(supervisorId: string) {
    // Remove existing entries for this supervisor
    await this.prisma.supervisorScope.deleteMany({
      where: { supervisorId }
    });

    // Get all users
    const users = await this.prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        managerId: true,
      }
    });

    // Find all reports for this supervisor
    const reports = await this.findAllReports(supervisorId, users);
    
    // Create new hierarchy entries
    const hierarchyEntries = reports.map(report => ({
      supervisorId,
      reportId: report.id,
      level: report.level,
    }));

    if (hierarchyEntries.length > 0) {
      await this.prisma.supervisorScope.createMany({
        data: hierarchyEntries,
        skipDuplicates: true,
      });
    }

    return hierarchyEntries.length;
  }

  /**
   * Find all reports for a supervisor (recursive)
   */
  private async findAllReports(supervisorId: string, users: any[], level = 1): Promise<Array<{id: string, level: number}>> {
    const reports = [];
    
    // Find direct reports
    const directReports = users.filter(user => user.managerId === supervisorId);
    
    for (const report of directReports) {
      reports.push({
        id: report.id,
        level: level
      });

      // Recursively find indirect reports
      const indirectReports = await this.findAllReports(report.id, users, level + 1);
      reports.push(...indirectReports);
    }

    return reports;
  }
}
