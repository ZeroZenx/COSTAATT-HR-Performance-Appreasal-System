import { Module } from '@nestjs/common';
import { FinalReviewService } from './final-review.service';
import { FinalReviewController } from './final-review.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FinalReviewService],
  controllers: [FinalReviewController],
  exports: [FinalReviewService],
})
export class FinalReviewModule {}
