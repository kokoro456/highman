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

  // ==================== REPORTS ====================

  @Get('reports/comprehensive')
  async getComprehensiveReport(
    @Headers('x-shop-id') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.dashboardService.getComprehensiveReport(shopId, startDate, endDate);
    return { data, message: 'ok' };
  }

  @Get('reports/revenue')
  async getRevenueReport(
    @Headers('x-shop-id') shopId: string,
    @Query('period') period: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const data = await this.dashboardService.getRevenueReport(
      shopId,
      period || 'monthly',
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1,
    );
    return { data, message: 'ok' };
  }

  @Get('reports/services')
  async getServiceReport(
    @Headers('x-shop-id') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.dashboardService.getServiceReport(shopId, startDate, endDate);
    return { data, message: 'ok' };
  }

  @Get('reports/customers')
  async getCustomerReport(
    @Headers('x-shop-id') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.dashboardService.getCustomerReport(shopId, startDate, endDate);
    return { data, message: 'ok' };
  }

  @Get('reports/hourly')
  async getHourlyReport(
    @Headers('x-shop-id') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.dashboardService.getHourlyReport(shopId, startDate, endDate);
    return { data, message: 'ok' };
  }
}
