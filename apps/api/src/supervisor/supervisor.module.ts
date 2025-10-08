import { Module } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { SupervisorController } from './supervisor.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SupervisorService],
  controllers: [SupervisorController],
  exports: [SupervisorService],
})
export class SupervisorModule {}
