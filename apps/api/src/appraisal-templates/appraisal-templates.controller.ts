import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppraisalTemplatesService } from './appraisal-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';
import { AppraisalTemplateType } from '@prisma/client';

@ApiTags('Appraisal Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppraisalTemplatesController {
  constructor(private appraisalTemplatesService: AppraisalTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all appraisal templates' })
  @ApiResponse({ status: 200, description: 'Appraisal templates retrieved successfully' })
  async findAll() {
    return this.appraisalTemplatesService.findAll();
  }

  @Get('defaults')
  @ApiOperation({ summary: 'Get default template configurations' })
  @ApiResponse({ status: 200, description: 'Default templates retrieved successfully' })
  async getDefaultTemplates() {
    return this.appraisalTemplatesService.getDefaultTemplates();
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get templates by type' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findByType(@Param('type') type: AppraisalTemplateType) {
    return this.appraisalTemplatesService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appraisal template by ID' })
  @ApiResponse({ status: 200, description: 'Appraisal template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal template not found' })
  async findOne(@Param('id') id: string) {
    return this.appraisalTemplatesService.findById(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Create new appraisal template (HR Admin only)' })
  @ApiResponse({ status: 201, description: 'Appraisal template created successfully' })
  async create(@Body() createData: {
    name: string;
    type: AppraisalTemplateType;
    configJson: any;
  }) {
    return this.appraisalTemplatesService.create(createData);
  }

  @Post('create-defaults')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Create default templates (HR Admin only)' })
  @ApiResponse({ status: 201, description: 'Default templates created successfully' })
  async createDefaultTemplates() {
    return this.appraisalTemplatesService.createDefaultTemplates();
  }

  @Put(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Update appraisal template (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Appraisal template updated successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal template not found' })
  async update(
    @Param('id') id: string,
    @Body() updateData: {
      name?: string;
      configJson?: any;
    },
  ) {
    return this.appraisalTemplatesService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Delete appraisal template (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Appraisal template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Appraisal template not found' })
  async delete(@Param('id') id: string) {
    return this.appraisalTemplatesService.delete(id);
  }
}

