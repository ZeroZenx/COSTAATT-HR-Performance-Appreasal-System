import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';
import { BookingsModule } from '../bookings/bookings.module';
import { TechnologiesModule } from '../technologies/technologies.module';

@Module({
  imports: [UsersModule, RoomsModule, BookingsModule, TechnologiesModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
