import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, Campus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@costaatt.edu.tt' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ enum: Campus, required: false })
  @IsOptional()
  @IsEnum(Campus)
  campus?: Campus;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
