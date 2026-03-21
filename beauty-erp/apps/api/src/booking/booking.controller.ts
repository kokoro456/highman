import { Controller, Get, Post, Put, Patch, Body, Param, Query, Headers } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    if (!shopId) {
      throw new (require('@nestjs/common').BadRequestException)('x-shop-id header is required');
    }
    const booking = await this.bookingService.create(shopId, body);
    return { data: booking, message: 'ok' };
  }

  @Get()
  async findByDate(
    @Headers('x-shop-id') shopId: string,
    @Query('date') date: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      const bookings = await this.bookingService.findByDateRange(shopId, startDate, endDate);
      return { data: bookings, message: 'ok' };
    }
    const bookings = await this.bookingService.findByDate(shopId, date || new Date().toISOString());
    return { data: bookings, message: 'ok' };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Headers('x-shop-id') shopId: string,
    @Body('status') status: string,
  ) {
    const booking = await this.bookingService.updateStatus(id, shopId, status);
    return { data: booking, message: 'ok' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Headers('x-shop-id') shopId: string, @Body() body: any) {
    const booking = await this.bookingService.update(id, shopId, body);
    return { data: booking, message: 'ok' };
  }
}
