import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupervisorService } from './supervisor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Supervisor Management')
@Controller('supervisor')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SupervisorController {
  constructor(private supervisorService: SupervisorService) {}

  @Get('hierarchy/rebuild')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Rebuild supervisor hierarchy' })
  @ApiResponse({ status: 200, description: 'Hierarchy rebuilt successfully' })
  async rebuildHierarchy() {
    const count = await this.supervisorService.buildSupervisorHierarchy();
    return {
      message: 'Supervisor hierarchy rebuilt successfully',
      relationshipsCreated: count
    };
  }

  @Get('reports')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get supervisor reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getReports(
    @CurrentUser() user: any,
    @Query('includeIndirect') includeIndirect?: boolean
  ) {
    const reports = await this.supervisorService.getSupervisorReports(
      user.id, 
      includeIndirect !== false
    );
    
    return {
      supervisor: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      reports: reports.map(report => ({
        id: report.report.id,
        name: `${report.report.firstName} ${report.report.lastName}`,
        email: report.report.email,
        dept: report.report.dept,
        title: report.report.title,
        level: report.level,
        isDirectReport: report.level === 1
      })),
      totalReports: reports.length,
      directReports: reports.filter(r => r.level === 1).length,
      indirectReports: reports.filter(r => r.level > 1).length
    };
  }

  @Get('reports/:reportId')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get specific report details' })
  @ApiResponse({ status: 200, description: 'Report details retrieved successfully' })
  async getReportDetails(
    @CurrentUser() user: any,
    @Param('reportId') reportId: string
  ) {
    const isSupervisor = await this.supervisorService.isSupervisor(user.id, reportId);
    
    if (!isSupervisor && user.role !== UserRole.HR_ADMIN) {
      throw new Error('You do not supervise this employee');
    }

    // Get report details
    const report = await this.supervisorService.getSupervisorReports(user.id)
      .then(reports => reports.find(r => r.report.id === reportId));

    if (!report) {
      throw new Error('Report not found');
    }

    return {
      report: {
        id: report.report.id,
        name: `${report.report.firstName} ${report.report.lastName}`,
        email: report.report.email,
        dept: report.report.dept,
        title: report.report.title,
        level: report.level,
        isDirectReport: report.level === 1
      }
    };
  }

  @Get('supervisors')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get user supervisors' })
  @ApiResponse({ status: 200, description: 'Supervisors retrieved successfully' })
  async getSupervisors(@CurrentUser() user: any) {
    const supervisors = await this.supervisorService.getUserSupervisors(user.id);
    
    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      supervisors: supervisors.map(supervisor => ({
        id: supervisor.supervisor.id,
        name: `${supervisor.supervisor.firstName} ${supervisor.supervisor.lastName}`,
        email: supervisor.supervisor.email,
        dept: supervisor.supervisor.dept,
        title: supervisor.supervisor.title,
        level: supervisor.level,
        isDirectSupervisor: supervisor.level === 1
      })),
      totalSupervisors: supervisors.length,
      directSupervisor: supervisors.find(s => s.level === 1),
      indirectSupervisors: supervisors.filter(s => s.level > 1)
    };
  }

  @Get('stats')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get supervisor statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    const stats = await this.supervisorService.getSupervisorStats();
    return {
      message: 'Supervisor statistics retrieved successfully',
      ...stats
    };
  }

  @Post('hierarchy/:supervisorId/rebuild')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Rebuild hierarchy for specific supervisor' })
  @ApiResponse({ status: 200, description: 'Hierarchy rebuilt successfully' })
  async rebuildSupervisorHierarchy(@Param('supervisorId') supervisorId: string) {
    const count = await this.supervisorService.rebuildSupervisorHierarchy(supervisorId);
    return {
      message: 'Supervisor hierarchy rebuilt successfully',
      relationshipsCreated: count
    };
  }
}
