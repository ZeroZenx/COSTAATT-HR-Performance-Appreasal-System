import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppraisalTemplatesService } from './appraisal-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';
import { AppraisalTemplateType } from '@prisma/client';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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

  @Get(':id/analytics')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get appraisal template analytics (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Appraisal template analytics retrieved successfully' })
  async getAnalytics(@Param('id') id: string) {
    return this.appraisalTemplatesService.getAnalytics(id);
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
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Appraisal template not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateTemplateDto,
  ) {
    try {
      console.log('Template update request:', { id, updateData: JSON.stringify(updateData, null, 2) });
      const result = await this.appraisalTemplatesService.update(id, updateData);
      return result;
    } catch (error: any) {
      console.error('Template update error in controller:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
        name: error.name,
        status: error.status,
        response: error.response,
      });
      
      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }
      
      // If it's a BadRequestException or NotFoundException, re-throw it
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      // For other errors, wrap them in an HttpException with appropriate status
      const statusCode = error.status || error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'An unexpected error occurred while updating the template';
      
      // Log full error for debugging
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Return detailed error in development
      throw new HttpException(
        {
          statusCode,
          message,
          error: 'Template update failed',
          details: process.env.NODE_ENV !== 'production' ? {
            originalMessage: error.message,
            stack: error.stack,
            code: error.code,
            meta: error.meta,
          } : undefined,
        },
        statusCode,
      );
    }
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

