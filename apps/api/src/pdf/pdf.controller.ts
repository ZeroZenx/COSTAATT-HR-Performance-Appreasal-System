import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('PDF')
@Controller('pdf')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PdfController {
  constructor(private pdfService: PdfService) {}

  @Get('appraisal/:id')
  @ApiOperation({ summary: 'Generate appraisal PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  async generateAppraisalPdf(@Param('id') id: string) {
    return this.pdfService.generateAppraisalPdf(id);
  }

  @Get('goals/:id')
  @ApiOperation({ summary: 'Generate goals PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  async generateGoalsPdf(@Param('id') id: string) {
    return this.pdfService.generateGoalsPdf(id);
  }

  @Get('midyear/:id')
  @ApiOperation({ summary: 'Generate mid-year PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  async generateMidYearPdf(@Param('id') id: string) {
    return this.pdfService.generateMidYearPdf(id);
  }
}

