import { Controller, Get, Post, Put, Patch, Body, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('public')
  async createPublic(@Body() body: any) {
    const { shopId, name, phone, serviceId, staffId, startTime, memo } = body;
    if (!shopId || !name || !phone || !serviceId || !staffId || !startTime) {
      throw new BadRequestException('shopId, name, phone, serviceId, staffId, startTime are required');
    }

    // Validate shop exists
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || !shop.isActive) throw new BadRequestException('유효하지 않은 매장입니다');

    // Find or create customer by phone within this shop
    let customer = await this.prisma.customer.findFirst({
      where: { shopId, phone },
    });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: { shopId, name, phone },
      });
    }

    const booking = await this.bookingService.create(shopId, {
      customerId: customer.id,
      staffId,
      serviceId,
      startTime,
      memo,
      source: 'B2C_WEB',
    });

    return { data: booking, message: 'ok' };
  }

  @Public()
  @Get('public')
  async publicBookingsByDate(
    @Query('shopId') shopId: string,
    @Query('date') date: string,
  ) {
    if (!shopId || !date) throw new BadRequestException('shopId and date are required');
    const bookings = await this.bookingService.findByDate(shopId, date);
    // Return only minimal info (time slots + staff) for privacy
    const slots = bookings.map((b: any) => ({
      staffId: b.staffId,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
    }));
    return { data: slots, message: 'ok' };
  }

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
