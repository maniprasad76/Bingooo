import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
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
