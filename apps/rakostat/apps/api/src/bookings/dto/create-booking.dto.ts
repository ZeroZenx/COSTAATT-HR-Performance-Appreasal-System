import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ example: 'Team Meeting' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Weekly team sync meeting', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2024-01-15T11:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 'room-id-123' })
  @IsString()
  roomId: string;

  @ApiProperty({ enum: BookingStatus, required: false, example: BookingStatus.PENDING })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
