import { Controller, Get, Query, Headers } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@Headers('x-shop-id') shopId: string) {
    const overview = await this.dashboardService.getOverview(shopId);
    return { data: overview, message: 'ok' };
  }

  @Get('revenue-chart')
  async getRevenueChart(
    @Headers('x-shop-id') shopId: string,
    @Query('days') days?: string,
  ) {
    const chart = await this.dashboardService.getRevenueChart(shopId, days ? parseInt(days) : 7);
    return { data: chart, message: 'ok' };
  }

  @Get('upcoming-bookings')
  async getUpcomingBookings(
    @Headers('x-shop-id') shopId: string,
    @Query('limit') limit?: string,
  ) {
    const bookings = await this.dashboardService.getUpcomingBookings(shopId, limit ? parseInt(limit) : 10);
    return { data: bookings, message: 'ok' };
  }

  @Get('staff-performance')
  async getStaffPerformance(
    @Headers('x-shop-id') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const performance = await this.dashboardService.getStaffPerformance(shopId, startDate, endDate);
    return { data: performance, message: 'ok' };
  }
}
