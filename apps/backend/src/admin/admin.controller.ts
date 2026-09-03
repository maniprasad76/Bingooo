import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('analytics.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store overview analytics and recent orders' })
  getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }
}
