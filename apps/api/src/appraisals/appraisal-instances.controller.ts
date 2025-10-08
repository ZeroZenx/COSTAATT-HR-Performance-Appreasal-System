import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppraisalInstancesService } from './appraisal-instances.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';

@ApiTags('Appraisal Instances')
@Controller('appraisal-instances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppraisalInstancesController {
  constructor(private appraisalInstancesService: AppraisalInstancesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all appraisal instances' })
  @ApiResponse({ status: 200, description: 'Appraisal instances retrieved successfully' })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('templateId') templateId?: string,
    @Query('cycleId') cycleId?: string,
    @Query('status') status?: string,
    @Query('dept') dept?: string,
    @Query('search') search?: string,
  ) {
    return this.appraisalInstancesService.findAll({
      employeeId,
      templateId,
      cycleId,
      status,
      dept,
      search,
    });
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available appraisal templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates() {
    return this.appraisalInstancesService.getTemplates();
  }

  @Get('cycles')
  @ApiOperation({ summary: 'Get available appraisal cycles' })
  @ApiResponse({ status: 200, description: 'Cycles retrieved successfully' })
  async getCycles() {
    return this.appraisalInstancesService.getCycles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appraisal instance by ID' })
  @ApiResponse({ status: 200, description: 'Appraisal instance retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal instance not found' })
  async findOne(@Param('id') id: string) {
    return this.appraisalInstancesService.findById(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Create new appraisal instance' })
  @ApiResponse({ status: 201, description: 'Appraisal instance created successfully' })
  async create(@Body() createData: {
    employeeId: string;
    templateId: string;
    cycleId: string;
    createdBy: string;
    options?: {
      selfAssessment?: boolean;
      peerFeedback?: boolean;
      studentEvaluations?: boolean;
      projectsEnabled?: boolean;
    };
  }) {
    return this.appraisalInstancesService.create(createData);
  }

  @Put(':id/sections')
  @ApiOperation({ summary: 'Update appraisal sections and calculate scores' })
  @ApiResponse({ status: 200, description: 'Sections updated successfully' })
  async updateSections(
    @Param('id') id: string,
    @Body() body: { sections: any[] }
  ) {
    return this.appraisalInstancesService.updateSections(id, body.sections);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit appraisal for review' })
  @ApiResponse({ status: 200, description: 'Appraisal submitted successfully' })
  async submitForReview(@Param('id') id: string) {
    return this.appraisalInstancesService.submitForReview(id);
  }

  @Post(':id/finalize')
  @Roles(UserRole.HR_ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Finalize appraisal' })
  @ApiResponse({ status: 200, description: 'Appraisal finalized successfully' })
  async finalize(@Param('id') id: string) {
    return this.appraisalInstancesService.finalize(id);
  }
}
