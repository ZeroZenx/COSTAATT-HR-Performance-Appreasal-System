import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AzureAdGuard } from './guards/azure-ad.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @Get('azure/callback')
  @UseGuards(AzureAdGuard)
  @ApiOperation({ summary: 'Azure AD callback endpoint' })
  async azureCallback(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout() {
    // In a stateless JWT system, logout is handled client-side
    return { message: 'Logged out successfully' };
  }
}
