import { IsString, IsEnum, IsInt, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Campus } from '@prisma/client';

export class CreateRoomDto {
  @ApiProperty({ example: 'Room 101' })
  @IsString()
  name: string;

  @ApiProperty({ enum: Campus, example: Campus.CITY_CAMPUS })
  @IsEnum(Campus)
  campus: Campus;

  @ApiProperty({ example: 30, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ type: [String], required: false, example: ['tech-id-1', 'tech-id-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologyIds?: string[];
}
