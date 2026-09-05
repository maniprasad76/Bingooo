import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store overview analytics and recent orders' })
  getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('analytics')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sales velocity, AOV, and category metrics' })
  getAnalytics(@Query('timeRange') timeRange?: string) {
    return this.adminService.getAnalytics(timeRange);
  }

  @Get('settings')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store settings' })
  updateSettings(@Body() body: Record<string, any>) {
    return this.adminService.updateSettings(body);
  }
}
