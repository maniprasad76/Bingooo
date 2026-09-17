import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { backupService } from '../common/services/backup.service';

@ApiTags('Admin - Backups')
@Controller('admin/backups')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class BackupController {
  @Get()
  @ApiOperation({ summary: 'List all database backups' })
  listBackups() {
    return {
      success: true,
      data: backupService.listBackups(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new database backup snapshot' })
  createBackup(@Body() body?: { label?: string }) {
    const backup = backupService.createBackup(body?.label);
    return {
      success: true,
      message: 'Backup created successfully',
      data: backup,
    };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore database from backup' })
  restoreBackup(@Param('id') id: string) {
    const result = backupService.restoreBackup(id);
    return {
      success: true,
      message: 'Database restored successfully',
      data: result,
    };
  }
}
