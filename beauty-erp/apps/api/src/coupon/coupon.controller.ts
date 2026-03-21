import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async create(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const coupon = await this.couponService.create(shopId, body);
    return { data: coupon, message: 'ok' };
  }

  @Get()
  async findAll(
    @Headers('x-shop-id') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.couponService.findAll(shopId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
    });
    return { ...result, message: 'ok' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    const coupon = await this.couponService.findOne(id, shopId);
    return { data: coupon, message: 'ok' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Headers('x-shop-id') shopId: string, @Body() body: any) {
    const coupon = await this.couponService.update(id, shopId, body);
    return { data: coupon, message: 'ok' };
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    const coupon = await this.couponService.deactivate(id, shopId);
    return { data: coupon, message: 'ok' };
  }

  @Post('validate')
  async validate(@Headers('x-shop-id') shopId: string, @Body() body: { code: string; amount?: number }) {
    const result = await this.couponService.validate(shopId, body);
    return { data: result, message: 'ok' };
  }

  @Post('apply')
  async apply(
    @Headers('x-shop-id') shopId: string,
    @Body() body: { code: string; customerId: string; paymentId?: string; amount: number },
  ) {
    const result = await this.couponService.apply(shopId, body);
    return { data: result, message: 'ok' };
  }
}
