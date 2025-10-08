import { Module } from '@nestjs/common';
import { AppraisalCyclesService } from './appraisal-cycles.service';
import { AppraisalCyclesController } from './appraisal-cycles.controller';

@Module({
  providers: [AppraisalCyclesService],
  controllers: [AppraisalCyclesController],
  exports: [AppraisalCyclesService],
})
export class AppraisalCyclesModule {}

