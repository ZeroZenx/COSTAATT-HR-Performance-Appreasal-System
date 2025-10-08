import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate presigned URL for file upload' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  async generatePresignedUrl(@Body() body: { key: string; contentType: string }) {
    return this.storageService.generatePresignedUrl(body.key, body.contentType);
  }
}

