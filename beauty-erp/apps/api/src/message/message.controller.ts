import { Controller, Get, Post, Delete, Body, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('sms')
  async sendSms(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const message = await this.messageService.sendSms(shopId, body);
    return { data: message, message: 'ok' };
  }

  @Post('bulk-sms')
  async sendBulkSms(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const result = await this.messageService.sendBulkSms(shopId, body);
    return { data: result, message: 'ok' };
  }

  @Post('alimtalk')
  async sendAlimtalk(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const message = await this.messageService.sendAlimtalk(shopId, body);
    return { data: message, message: 'ok' };
  }

  @Get()
  async getHistory(
    @Headers('x-shop-id') shopId: string,
    @Query('type') type?: string,
    @Query('channel') channel?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const result = await this.messageService.getMessageHistory(shopId, {
      type,
      channel,
      startDate,
      endDate,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return { ...result, message: 'ok' };
  }

  @Get('stats')
  async getStats(@Headers('x-shop-id') shopId: string) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const stats = await this.messageService.getMessageStats(shopId);
    return { data: stats, message: 'ok' };
  }

  @Post('visit-reminder')
  async sendVisitReminder(@Headers('x-shop-id') shopId: string) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const result = await this.messageService.sendVisitReminder(shopId);
    return { data: result, message: 'ok' };
  }

  @Post('post-visit')
  async sendPostVisit(@Headers('x-shop-id') shopId: string) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const result = await this.messageService.sendPostVisitMessage(shopId);
    return { data: result, message: 'ok' };
  }

  @Get('templates')
  async getTemplates(@Headers('x-shop-id') shopId: string) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const templates = await this.messageService.getMessageTemplates(shopId);
    return { data: templates, message: 'ok' };
  }

  @Post('templates')
  async createTemplate(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const template = await this.messageService.createMessageTemplate(shopId, body);
    return { data: template, message: 'ok' };
  }

  @Delete('templates/:id')
  async deleteTemplate(@Headers('x-shop-id') shopId: string, @Param('id') id: string) {
    if (!shopId) throw new BadRequestException('x-shop-id header is required');
    const template = await this.messageService.deleteMessageTemplate(shopId, id);
    return { data: template, message: 'ok' };
  }
}
