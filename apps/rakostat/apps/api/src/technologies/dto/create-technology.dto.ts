import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnologyDto {
  @ApiProperty({ example: 'Projector' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'HD Projector for presentations', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
