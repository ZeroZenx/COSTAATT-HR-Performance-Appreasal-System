import { Module } from '@nestjs/common';
import { CompetenciesService } from './competencies.service';
import { CompetenciesController } from './competencies.controller';

@Module({
  providers: [CompetenciesService],
  controllers: [CompetenciesController],
  exports: [CompetenciesService],
})
export class CompetenciesModule {}

