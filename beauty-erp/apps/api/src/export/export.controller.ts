import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('customers')
  async exportCustomers(
    @Headers('x-shop-id') shopId: string,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportCustomers(shopId);
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="customers-${date}.csv"`);
    res.send(csv);
  }

  @Get('bookings')
  async exportBookings(
    @Headers('x-shop-id') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportBookings(shopId, startDate, endDate);
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="bookings-${date}.csv"`);
    res.send(csv);
  }

  @Get('payments')
  async exportPayments(
    @Headers('x-shop-id') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportPayments(shopId, startDate, endDate);
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="payments-${date}.csv"`);
    res.send(csv);
  }

  @Get('staff')
  async exportStaff(
    @Headers('x-shop-id') shopId: string,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportStaff(shopId);
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="staff-${date}.csv"`);
    res.send(csv);
  }
}
