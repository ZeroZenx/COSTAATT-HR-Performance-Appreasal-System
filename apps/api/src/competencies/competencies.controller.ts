import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompetenciesService } from './competencies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CompetencyCluster } from '@costaatt/shared';

@ApiTags('Competencies')
@Controller('competencies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompetenciesController {
  constructor(private competenciesService: CompetenciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all competencies' })
  @ApiResponse({ status: 200, description: 'Competencies retrieved successfully' })
  async findAll(
    @Query('cluster') cluster?: CompetencyCluster,
    @Query('department') department?: string,
    @Query('active') active?: boolean,
    @Query('search') search?: string,
  ) {
    return this.competenciesService.findAll({ cluster, department, active, search });
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  async getDepartments() {
    return this.competenciesService.getDepartments();
  }

  @Get('stats')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get competency statistics (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.competenciesService.getCompetencyStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get competency by ID' })
  @ApiResponse({ status: 200, description: 'Competency retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Competency not found' })
  async findOne(@Param('id') id: string) {
    return this.competenciesService.findById(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Create new competency (HR Admin only)' })
  @ApiResponse({ status: 201, description: 'Competency created successfully' })
  async create(@Body() createData: {
    code: string;
    title: string;
    cluster: CompetencyCluster;
    department: string;
    definition: string;
    behaviorsBasic: string;
    behaviorsAbove: string;
    behaviorsOutstanding: string;
  }) {
    return this.competenciesService.create(createData);
  }

  @Post('bulk')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Create multiple competencies (HR Admin only)' })
  @ApiResponse({ status: 201, description: 'Competencies created successfully' })
  async bulkCreate(@Body() competencies: Array<{
    code: string;
    title: string;
    cluster: CompetencyCluster;
    department: string;
    definition: string;
    behaviorsBasic: string;
    behaviorsAbove: string;
    behaviorsOutstanding: string;
  }>) {
    return this.competenciesService.bulkCreate(competencies);
  }

  @Put(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Update competency (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Competency updated successfully' })
  @ApiResponse({ status: 404, description: 'Competency not found' })
  async update(
    @Param('id') id: string,
    @Body() updateData: {
      code?: string;
      title?: string;
      cluster?: CompetencyCluster;
      department?: string;
      definition?: string;
      behaviorsBasic?: string;
      behaviorsAbove?: string;
      behaviorsOutstanding?: string;
      active?: boolean;
    },
  ) {
    return this.competenciesService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Delete competency (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Competency deleted successfully' })
  @ApiResponse({ status: 404, description: 'Competency not found' })
  async delete(@Param('id') id: string) {
    return this.competenciesService.delete(id);
  }
}

