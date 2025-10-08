import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@costaatt/shared';

export class LoginDto {
  @ApiProperty({ example: 'admin@costaatt.edu.tt' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@costaatt.edu.tt' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.HR_ADMIN })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'Human Resources' })
  @IsString()
  dept: string;

  @ApiProperty({ example: 'HR Manager' })
  @IsString()
  title: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'admin@costaatt.edu.tt' })
  @IsEmail()
  email: string;
}

