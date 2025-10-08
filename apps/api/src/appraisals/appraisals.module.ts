import { Module } from '@nestjs/common';
import { AppraisalsService } from './appraisals.service';
import { AppraisalsController } from './appraisals.controller';
import { AppraisalInstancesService } from './appraisal-instances.service';
import { AppraisalInstancesController } from './appraisal-instances.controller';
import { ScoringService } from './scoring.service';

@Module({
  providers: [AppraisalsService, AppraisalInstancesService, ScoringService],
  controllers: [AppraisalsController, AppraisalInstancesController],
  exports: [AppraisalsService, AppraisalInstancesService, ScoringService],
})
export class AppraisalsModule {}

