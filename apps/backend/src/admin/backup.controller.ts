import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { backupService } from '../common/services/backup.service';

@ApiTags('Admin - Backups')
@Controller('admin/backups')
@UseGuards(AuthGuard, RolesGuard)
@Permissions('backups.manage')
@ApiBearerAuth()
export class BackupController {
  @Get()
  @ApiOperation({ summary: 'List all database backups' })
  async listBackups() {
    return {
      success: true,
      data: await backupService.listAllBackups(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new database backup snapshot' })
  async createBackup(@Body() body?: { label?: string }) {
    const backup = await backupService.createBackupDurable(body?.label);
    return {
      success: true,
      message: 'Backup created successfully',
      data: backup,
    };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore database from backup' })
  async restoreBackup(@Param('id') id: string) {
    const result = await backupService.restoreBackupDurable(id);
    return {
      success: true,
      message: 'Database restored successfully',
      data: result,
    };
  }
}
