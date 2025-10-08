import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  UseInterceptors,
  UploadedFile,
  Delete
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { SelfAppraisalService, CreateSelfAppraisalDto, UpdateSelfAppraisalDto, ReturnSelfAppraisalDto } from './self-appraisal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@costaatt/shared';
import { SelfAppraisalStatus } from '@prisma/client';

@ApiTags('Self-Appraisal Management')
@Controller('self-appraisals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SelfAppraisalController {
  constructor(private selfAppraisalService: SelfAppraisalService) {}

  @Post('seed')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Seed self-appraisal tasks for all employees in a cycle' })
  @ApiResponse({ status: 201, description: 'Self-appraisals seeded successfully' })
  async seedSelfAppraisals(
    @Query('cycleId') cycleId: string,
    @CurrentUser() user: any
  ) {
    const result = await this.selfAppraisalService.seedSelfAppraisals(cycleId);
    return {
      message: 'Self-appraisals seeded successfully',
      ...result
    };
  }

  @Get('mine')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get current user\'s self-appraisal for a cycle' })
  @ApiResponse({ status: 200, description: 'Self-appraisal retrieved successfully' })
  async getMySelfAppraisal(
    @Query('cycleId') cycleId: string,
    @CurrentUser() user: any
  ) {
    return this.selfAppraisalService.getMySelfAppraisal(user.id, cycleId);
  }

  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get self-appraisal by ID' })
  @ApiResponse({ status: 200, description: 'Self-appraisal retrieved successfully' })
  async getSelfAppraisalById(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.selfAppraisalService.getSelfAppraisalById(id, user.id, user.role);
  }

  @Patch(':id')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update self-appraisal (employee only)' })
  @ApiResponse({ status: 200, description: 'Self-appraisal updated successfully' })
  async updateSelfAppraisal(
    @Param('id') id: string,
    @Body() data: UpdateSelfAppraisalDto,
    @CurrentUser() user: any
  ) {
    return this.selfAppraisalService.updateSelfAppraisal(id, user.id, data);
  }

  @Post(':id/submit')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Submit self-appraisal' })
  @ApiResponse({ status: 200, description: 'Self-appraisal submitted successfully' })
  async submitSelfAppraisal(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.selfAppraisalService.submitSelfAppraisal(id, user.id);
  }

  @Post(':id/return')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Return self-appraisal for edits' })
  @ApiResponse({ status: 200, description: 'Self-appraisal returned for edits' })
  async returnSelfAppraisal(
    @Param('id') id: string,
    @Body() data: ReturnSelfAppraisalDto,
    @CurrentUser() user: any
  ) {
    return this.selfAppraisalService.returnSelfAppraisal(id, user.id, user.role, data);
  }

  @Post(':id/lock')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Lock self-appraisal to final (HR only)' })
  @ApiResponse({ status: 200, description: 'Self-appraisal locked successfully' })
  async lockSelfAppraisal(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.selfAppraisalService.lockSelfAppraisal(id, user.id);
  }

  @Get('team/overview')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get team self-appraisals overview' })
  @ApiResponse({ status: 200, description: 'Team self-appraisals retrieved successfully' })
  async getTeamSelfAppraisals(
    @CurrentUser() user: any,
    @Query('cycleId') cycleId?: string
  ) {
    return this.selfAppraisalService.getTeamSelfAppraisals(user.id, cycleId);
  }

  @Get('admin/all')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get all self-appraisals (HR only)' })
  @ApiResponse({ status: 200, description: 'All self-appraisals retrieved successfully' })
  async getAllSelfAppraisals(
    @Query('cycleId') cycleId?: string,
    @Query('status') status?: SelfAppraisalStatus
  ) {
    return this.selfAppraisalService.getAllSelfAppraisals(cycleId, status);
  }

  @Get('stats/overview')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get self-appraisal statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getSelfAppraisalStats(
    @Query('cycleId') cycleId?: string
  ) {
    return this.selfAppraisalService.getSelfAppraisalStats(cycleId);
  }

  @Post(':id/attachments')
  @Roles(UserRole.EMPLOYEE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload attachment to self-appraisal' })
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  async uploadAttachment(
    @Param('id') id: string,
    @Body('questionKey') questionKey: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    // TODO: Implement file upload logic
    return {
      message: 'Attachment upload not yet implemented',
      questionKey,
      fileName: file.originalname
    };
  }

  @Delete(':id/attachments/:attachmentId')
  @Roles(UserRole.EMPLOYEE, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Delete attachment from self-appraisal' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: any
  ) {
    // TODO: Implement file deletion logic
    return {
      message: 'Attachment deletion not yet implemented',
      attachmentId
    };
  }
}
