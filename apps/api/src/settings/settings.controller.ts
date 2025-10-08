import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.HR_ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // System Stats
  @Get('stats')
  async getSystemStats() {
    return this.settingsService.getSystemStats();
  }

  // Cycles Management
  @Get('cycles')
  async getCycles() {
    return this.settingsService.getCycles();
  }

  @Post('cycles')
  async createCycle(@Body() cycleData: any) {
    return this.settingsService.createCycle(cycleData);
  }

  @Put('cycles/:id')
  async updateCycle(@Param('id') id: string, @Body() cycleData: any) {
    return this.settingsService.updateCycle(id, cycleData);
  }

  @Delete('cycles/:id')
  async deleteCycle(@Param('id') id: string) {
    return this.settingsService.deleteCycle(id);
  }

  @Post('cycles/:id/duplicate')
  async duplicateCycle(@Param('id') id: string) {
    return this.settingsService.duplicateCycle(id);
  }

  @Post('cycles/:id/close')
  async closeCycle(@Param('id') id: string) {
    return this.settingsService.closeCycle(id);
  }

  // Templates Management
  @Get('templates')
  async getTemplates() {
    return this.settingsService.getTemplates();
  }

  @Post('templates')
  async createTemplate(@Body() templateData: any) {
    return this.settingsService.createTemplate(templateData);
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() templateData: any) {
    return this.settingsService.updateTemplate(id, templateData);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    return this.settingsService.deleteTemplate(id);
  }

  @Post('templates/:id/publish')
  async publishTemplate(@Param('id') id: string) {
    return this.settingsService.publishTemplate(id);
  }

  // Users Management
  @Get('users')
  async getUsers(@Query('search') search?: string, @Query('role') role?: string) {
    return this.settingsService.getUsers({ search, role });
  }

  @Post('users')
  async createUser(@Body() userData: any) {
    return this.settingsService.createUser(userData);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() userData: any) {
    return this.settingsService.updateUser(id, userData);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.settingsService.deleteUser(id);
  }

  @Post('users/bulk')
  async bulkUpdateUsers(@Body() bulkData: any) {
    return this.settingsService.bulkUpdateUsers(bulkData);
  }

  // Import/Export
  @Post('import/employees')
  async importEmployees(@Body() importData: any) {
    return this.settingsService.importEmployees(importData);
  }

  @Get('export/:type')
  async exportData(@Param('type') type: string, @Query() filters: any) {
    return this.settingsService.exportData(type, filters);
  }

  // SSO Configuration
  @Get('sso')
  async getSSOConfig() {
    return this.settingsService.getSSOConfig();
  }

  @Put('sso')
  async updateSSOConfig(@Body() ssoData: any) {
    return this.settingsService.updateSSOConfig(ssoData);
  }

  @Post('sso/test')
  async testSSOConnection() {
    return this.settingsService.testSSOConnection();
  }

  @Post('sso/enable')
  async enableSSO() {
    return this.settingsService.enableSSO();
  }

  @Post('sso/disable')
  async disableSSO() {
    return this.settingsService.disableSSO();
  }

  // Audit Logs
  @Get('audit')
  async getAuditLogs(@Query() filters: any) {
    return this.settingsService.getAuditLogs(filters);
  }

  @Post('audit/export')
  async exportAuditLogs(@Body() filters: any) {
    return this.settingsService.exportAuditLogs(filters);
  }

  // System Configuration
  @Get('config')
  async getSystemConfig() {
    return this.settingsService.getSystemConfig();
  }

  @Put('config')
  async updateSystemConfig(@Body() configData: any) {
    return this.settingsService.updateSystemConfig(configData);
  }

  // Backup Management
  @Get('backup')
  async getBackupStatus() {
    return this.settingsService.getBackupStatus();
  }

  @Post('backup/run')
  async runBackup() {
    return this.settingsService.runBackup();
  }

  // Health Checks
  @Get('health')
  async getHealthStatus() {
    return this.settingsService.getHealthStatus();
  }

  @Get('health/sso')
  async getSSOHealth() {
    return this.settingsService.getSSOHealth();
  }
}