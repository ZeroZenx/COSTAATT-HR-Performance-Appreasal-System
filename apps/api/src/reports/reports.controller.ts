import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('scores')
  @Roles(UserRole.HR_ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get score distribution report' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  async getScoreDistribution(
    @Query('cycle') cycleId?: string,
    @Query('dept') dept?: string,
  ) {
    return this.reportsService.getScoreDistribution(cycleId, dept);
  }

  @Get('midyear')
  @Roles(UserRole.HR_ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get mid-year status report' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  async getMidYearStatus(@Query('cycle') cycleId?: string) {
    return this.reportsService.getMidYearStatus(cycleId);
  }

  @Get('goals')
  @Roles(UserRole.HR_ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get goal completion report' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  async getGoalCompletion(
    @Query('cycle') cycleId?: string,
    @Query('dept') dept?: string,
  ) {
    return this.reportsService.getGoalCompletion(cycleId, dept);
  }
}

