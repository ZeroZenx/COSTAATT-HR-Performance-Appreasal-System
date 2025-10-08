import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FinalReviewService, FinalReviewDto, SignatureDto, RecommendationDto } from './final-review.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@costaatt/shared';

@ApiTags('Final Review & Recommendation')
@Controller('final-reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinalReviewController {
  constructor(private finalReviewService: FinalReviewService) {}

  @Get(':appraisalId')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get final review for an appraisal' })
  @ApiResponse({ status: 200, description: 'Final review retrieved successfully' })
  async getFinalReview(
    @Param('appraisalId') appraisalId: string,
    @CurrentUser() user: any
  ) {
    return this.finalReviewService.getFinalReview(appraisalId, user.id, user.role);
  }

  @Patch(':appraisalId')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Create or update final review' })
  @ApiResponse({ status: 200, description: 'Final review updated successfully' })
  async createOrUpdateFinalReview(
    @Param('appraisalId') appraisalId: string,
    @Body() data: FinalReviewDto,
    @CurrentUser() user: any
  ) {
    return this.finalReviewService.createOrUpdateFinalReview(appraisalId, user.id, user.role, data);
  }

  @Post(':appraisalId/employee-sign')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Employee signs final review' })
  @ApiResponse({ status: 200, description: 'Employee signature recorded successfully' })
  async employeeSign(
    @Param('appraisalId') appraisalId: string,
    @Body() data: SignatureDto,
    @CurrentUser() user: any
  ) {
    return this.finalReviewService.employeeSign(appraisalId, user.id, data);
  }

  @Post(':appraisalId/supervisor-sign')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Supervisor signs final review' })
  @ApiResponse({ status: 200, description: 'Supervisor signature recorded successfully' })
  async supervisorSign(
    @Param('appraisalId') appraisalId: string,
    @Body() data: SignatureDto,
    @CurrentUser() user: any
  ) {
    return this.finalReviewService.supervisorSign(appraisalId, user.id, data);
  }

  @Post(':appraisalId/divisional-sign')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Divisional head signs final review with recommendation' })
  @ApiResponse({ status: 200, description: 'Divisional signature and recommendation recorded successfully' })
  async divisionalSign(
    @Param('appraisalId') appraisalId: string,
    @Body() data: RecommendationDto,
    @CurrentUser() user: any
  ) {
    return this.finalReviewService.divisionalSign(appraisalId, user.id, data);
  }

  @Post(':appraisalId/hr-finalize')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'HR finalizes the review and locks it' })
  @ApiResponse({ status: 200, description: 'Final review finalized and locked successfully' })
  async hrFinalize(
    @Param('appraisalId') appraisalId: string,
    @CurrentUser() user: any
  ) {
    return this.finalReviewService.hrFinalize(appraisalId, user.id);
  }

  @Get('team/overview')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get team final reviews overview' })
  @ApiResponse({ status: 200, description: 'Team final reviews retrieved successfully' })
  async getTeamFinalReviews(
    @CurrentUser() user: any,
    @Query('cycleId') cycleId?: string
  ) {
    return this.finalReviewService.getTeamFinalReviews(user.id, cycleId);
  }

  @Get('admin/all')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get all final reviews (HR only)' })
  @ApiResponse({ status: 200, description: 'All final reviews retrieved successfully' })
  async getAllFinalReviews(
    @Query('cycleId') cycleId?: string,
    @Query('status') status?: string
  ) {
    return this.finalReviewService.getAllFinalReviews(cycleId, status);
  }

  @Get('stats/overview')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get final review statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getFinalReviewStats(
    @Query('cycleId') cycleId?: string
  ) {
    return this.finalReviewService.getFinalReviewStats(cycleId);
  }
}
