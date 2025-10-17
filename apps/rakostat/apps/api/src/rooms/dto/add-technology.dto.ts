import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTechnologyDto {
  @ApiProperty({ example: 'tech-id-123' })
  @IsString()
  technologyId: string;
}
