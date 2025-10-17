import { Module } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { TechnologiesController } from './technologies.controller';

@Module({
  providers: [TechnologiesService],
  controllers: [TechnologiesController],
  exports: [TechnologiesService],
})
export class TechnologiesModule {}
