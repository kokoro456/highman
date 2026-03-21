import { Controller, Get, Post, Body, Query, Headers } from '@nestjs/common';
import { PgService } from './pg.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('pg')
export class PgController {
  constructor(private readonly pgService: PgService) {}

  @Get('client-key')
  getClientKey() {
    return { data: { clientKey: this.pgService.getClientKey() }, message: 'ok' };
  }

  @Post('orders')
  async createOrder(
    @Headers('x-shop-id') shopId: string,
    @Body()
    body: {
      amount: number;
      productName: string;
      customerName?: string;
      customerPhone?: string;
    },
  ) {
    const order = await this.pgService.createOrder(shopId, body);
    return { data: order, message: 'ok' };
  }

  @Public()
  @Post('confirm')
  async confirmPayment(
    @Body() body: { orderId: string; paymentKey: string; amount: number },
  ) {
    const result = await this.pgService.confirmPayment(
      body.orderId,
      body.paymentKey,
      body.amount,
    );
    return { data: result, message: 'ok' };
  }

  @Get('history')
  async getPaymentHistory(
    @Headers('x-shop-id') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.pgService.getPaymentHistory(
      shopId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
    return { ...result, message: 'ok' };
  }

  @Public()
  @Get('orders')
  async getOrder(@Query('orderId') orderId: string) {
    const order = await this.pgService.getOrder(orderId);
    return { data: order, message: 'ok' };
  }
}
