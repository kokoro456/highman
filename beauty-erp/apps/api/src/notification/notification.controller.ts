import { Controller, Get, Patch, Param, Query, Headers } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(
    @Headers('x-shop-id') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const result = await this.notificationService.findAll(shopId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
    return { ...result, message: 'ok' };
  }

  @Get('count')
  async getUnreadCount(@Headers('x-shop-id') shopId: string) {
    const result = await this.notificationService.getUnreadCount(shopId);
    return { data: result, message: 'ok' };
  }

  @Patch('read-all')
  async markAllAsRead(@Headers('x-shop-id') shopId: string) {
    await this.notificationService.markAllAsRead(shopId);
    return { message: 'ok' };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    await this.notificationService.markAsRead(id, shopId);
    return { message: 'ok' };
  }
}
