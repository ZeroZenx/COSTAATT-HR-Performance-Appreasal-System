import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuditInterceptor } from './audit.interceptor';
import { Audit } from './audit.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles(UserRole.HR_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Audit({
    action: 'VIEW_AUDIT_LOGS',
    entity: 'AuditLog',
    description: 'View audit logs',
  })
  @ApiOperation({ summary: 'Get audit logs with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiQuery({ name: 'entity', required: false, description: 'Filter by entity type' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type' })
  @ApiQuery({ name: 'actorId', required: false, description: 'Filter by actor ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (ISO string)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50)' })
  async getAuditLogs(
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('actorId') actorId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = {
      entity,
      action,
      actorId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      page: page || 1,
      limit: limit || 50,
    };

    return this.auditService.getAuditLogs(filters);
  }

  @Get('stats')
  @Roles(UserRole.HR_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Audit({
    action: 'VIEW_AUDIT_STATS',
    entity: 'AuditLog',
    description: 'View audit statistics',
  })
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (day, week, month)', enum: ['day', 'week', 'month'] })
  async getAuditStats(@Query('period') period: 'day' | 'week' | 'month' = 'month') {
    return this.auditService.getAuditStats(period);
  }
}

