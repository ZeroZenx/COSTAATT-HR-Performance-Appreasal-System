import { Module } from '@nestjs/common';
import { SelfAppraisalService } from './self-appraisal.service';
import { SelfAppraisalController } from './self-appraisal.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SelfAppraisalService],
  controllers: [SelfAppraisalController],
  exports: [SelfAppraisalService],
})
export class SelfAppraisalModule {}
