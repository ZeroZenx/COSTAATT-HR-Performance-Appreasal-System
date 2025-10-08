import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppraisalCyclesService } from './appraisal-cycles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';

@ApiTags('Appraisal Cycles')
@Controller('cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppraisalCyclesController {
  constructor(private appraisalCyclesService: AppraisalCyclesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all appraisal cycles' })
  @ApiResponse({ status: 200, description: 'Appraisal cycles retrieved successfully' })
  async findAll() {
    return this.appraisalCyclesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active appraisal cycle' })
  @ApiResponse({ status: 200, description: 'Active cycle retrieved successfully' })
  async getActiveCycle() {
    return this.appraisalCyclesService.getActiveCycle();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appraisal cycle by ID' })
  @ApiResponse({ status: 200, description: 'Appraisal cycle retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal cycle not found' })
  async findOne(@Param('id') id: string) {
    return this.appraisalCyclesService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get appraisal cycle statistics' })
  @ApiResponse({ status: 200, description: 'Cycle statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal cycle not found' })
  async getCycleStats(@Param('id') id: string) {
    return this.appraisalCyclesService.getCycleStats(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Create new appraisal cycle (HR Admin only)' })
  @ApiResponse({ status: 201, description: 'Appraisal cycle created successfully' })
  async create(@Body() createData: {
    name: string;
    periodStart: string;
    periodEnd: string;
    status?: string;
  }) {
    return this.appraisalCyclesService.create({
      ...createData,
      periodStart: new Date(createData.periodStart),
      periodEnd: new Date(createData.periodEnd),
    });
  }

  @Put(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Update appraisal cycle (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Appraisal cycle updated successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal cycle not found' })
  async update(
    @Param('id') id: string,
    @Body() updateData: {
      name?: string;
      periodStart?: string;
      periodEnd?: string;
      status?: string;
    },
  ) {
    const data: any = { ...updateData };
    if (updateData.periodStart) {
      data.periodStart = new Date(updateData.periodStart);
    }
    if (updateData.periodEnd) {
      data.periodEnd = new Date(updateData.periodEnd);
    }

    return this.appraisalCyclesService.update(id, data);
  }

  @Put(':id/activate')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Activate appraisal cycle (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Appraisal cycle activated successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal cycle not found' })
  async activateCycle(@Param('id') id: string) {
    return this.appraisalCyclesService.activateCycle(id);
  }

  @Put(':id/close')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Close appraisal cycle (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Appraisal cycle closed successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal cycle not found' })
  async closeCycle(@Param('id') id: string) {
    return this.appraisalCyclesService.closeCycle(id);
  }

  @Delete(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Delete appraisal cycle (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Appraisal cycle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal cycle not found' })
  async delete(@Param('id') id: string) {
    return this.appraisalCyclesService.delete(id);
  }
}

