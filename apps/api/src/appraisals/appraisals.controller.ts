import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppraisalsService } from './appraisals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';

@ApiTags('Appraisals')
@Controller('appraisals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppraisalsController {
  constructor(private appraisalsService: AppraisalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all appraisals' })
  @ApiResponse({ status: 200, description: 'Appraisals retrieved successfully' })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('supervisorId') supervisorId?: string,
    @Query('cycleId') cycleId?: string,
    @Query('templateId') templateId?: string,
    @Query('status') status?: string,
    @Query('dept') dept?: string,
    @Query('search') search?: string,
  ) {
    return this.appraisalsService.findAll({
      employeeId,
      supervisorId,
      cycleId,
      templateId,
      status: status as any,
      dept,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appraisal by ID' })
  @ApiResponse({ status: 200, description: 'Appraisal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal not found' })
  async findOne(@Param('id') id: string) {
    return this.appraisalsService.findById(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Create new appraisal' })
  @ApiResponse({ status: 201, description: 'Appraisal created successfully' })
  async create(@Body() createData: {
    employeeId: string;
    supervisorId: string;
    templateId: string;
    cycleId: string;
    competencyIds: string[];
  }) {
    return this.appraisalsService.create(createData);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update appraisal status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    return this.appraisalsService.updateStatus(id, body.status as any);
  }

  @Post(':id/submit-for-ack')
  @ApiOperation({ summary: 'Submit appraisal for acknowledgment' })
  @ApiResponse({ status: 200, description: 'Appraisal submitted successfully' })
  async submitForAcknowledgment(@Param('id') id: string) {
    return this.appraisalsService.submitForAcknowledgment(id);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign appraisal' })
  @ApiResponse({ status: 200, description: 'Appraisal signed successfully' })
  async signAppraisal(
    @Param('id') id: string,
    @Body() body: { role: string }
  ) {
    return this.appraisalsService.signAppraisal(id, 'current-user-id', body.role as any);
  }
}
