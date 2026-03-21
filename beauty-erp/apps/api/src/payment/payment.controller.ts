import { Controller, Get, Post, Body, Query, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const payment = await this.paymentService.create(shopId, body);
    return { data: payment, message: 'ok' };
  }

  @Get()
  async findAll(
    @Headers('x-shop-id') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.paymentService.findAll(shopId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      startDate, endDate,
    });
    return { ...result, message: 'ok' };
  }

  @Post('passes')
  async createPass(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const pass = await this.paymentService.createPass(shopId, body);
    return { data: pass, message: 'ok' };
  }

  @Get('passes')
  async findPasses(
    @Headers('x-shop-id') shopId: string,
    @Query('customerId') customerId?: string,
  ) {
    const passes = await this.paymentService.findPasses(shopId, customerId);
    return { data: passes, message: 'ok' };
  }

  @Get('summary')
  async getDailySummary(
    @Headers('x-shop-id') shopId: string,
    @Query('date') date: string,
  ) {
    const summary = await this.paymentService.getDailySummary(shopId, date || new Date().toISOString());
    return { data: summary, message: 'ok' };
  }
}
