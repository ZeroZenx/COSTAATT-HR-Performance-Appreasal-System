import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, Req } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterDto, ChangePasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { UserRole } from '@costaatt/shared';
import { AuditService } from '../audit/audit.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditService: AuditService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() req: ExpressRequest) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      // Log failed login attempt
      await this.auditService.logAuth('LOGIN_FAILED', loginDto.email, this.getClientIp(req), req.get('User-Agent'));
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Log successful login
    await this.auditService.logAuth('LOGIN', user.id, this.getClientIp(req), req.get('User-Agent'));
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user (dev only)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() body: { refreshToken: string }) {
    // In a real implementation, you would validate the refresh token
    // For now, we'll extract the user ID from the token
    // This is a simplified implementation
    throw new Error('Refresh token validation not implemented');
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid current password' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    return this.authService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    return req.user;
  }

  private getClientIp(req: ExpressRequest): string {
    return (
      req.get('X-Forwarded-For') ||
      req.get('X-Real-IP') ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }
}

