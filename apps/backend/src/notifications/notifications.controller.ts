import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

// Internal staff alert feed (order/stock/payment/custom categories) — there's
// no per-user field on a notification, so this is admin-only, not a
// per-customer inbox. Previously unauthenticated: anyone could read, mark
// read, delete, or forge entries in the ops alert feed.
@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
@Permissions('notifications.manage')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification feed' })
  findAll(@Query('category') category?: string) {
    return this.notificationsService.findAll(category);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dismiss or delete notification' })
  delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  @Post()
  @ApiOperation({ summary: 'Publish notification alert' })
  create(
    @Body()
    body: {
      category: 'order' | 'custom' | 'stock' | 'payment';
      severity: 'info' | 'warning' | 'critical';
      title: string;
      description: string;
      linkHref?: string;
      linkText?: string;
    },
  ) {
    return this.notificationsService.create(body);
  }
}
