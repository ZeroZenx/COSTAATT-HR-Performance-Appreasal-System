import { Module } from '@nestjs/common';
import { AppraisalTemplatesService } from './appraisal-templates.service';
import { AppraisalTemplatesController } from './appraisal-templates.controller';

@Module({
  providers: [AppraisalTemplatesService],
  controllers: [AppraisalTemplatesController],
  exports: [AppraisalTemplatesService],
})
export class AppraisalTemplatesModule {}

