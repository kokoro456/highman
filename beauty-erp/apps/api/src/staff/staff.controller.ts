import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Public()
  @Get('public')
  async publicStaff(@Query('shopId') shopId: string) {
    if (!shopId) throw new BadRequestException('shopId is required');
    const staffList = await this.staffService.findAll(shopId);
    return { data: staffList, message: 'ok' };
  }

  @Post()
  async create(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const staff = await this.staffService.create(shopId, body);
    return { data: staff, message: 'ok' };
  }

  @Get()
  async findAll(@Headers('x-shop-id') shopId: string) {
    const staffList = await this.staffService.findAll(shopId);
    return { data: staffList, message: 'ok' };
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    const staff = await this.staffService.findById(id, shopId);
    return { data: staff, message: 'ok' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Headers('x-shop-id') shopId: string, @Body() body: any) {
    const staff = await this.staffService.update(id, shopId, body);
    return { data: staff, message: 'ok' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    await this.staffService.delete(id, shopId);
    return { data: null, message: 'ok' };
  }

  @Post('schedules')
  async upsertSchedule(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const schedule = await this.staffService.upsertSchedule(shopId, body);
    return { data: schedule, message: 'ok' };
  }

  @Post('incentives')
  async createIncentive(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const incentive = await this.staffService.createIncentive(shopId, body);
    return { data: incentive, message: 'ok' };
  }

  @Get(':id/stats')
  async getStats(
    @Param('id') id: string,
    @Headers('x-shop-id') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const stats = await this.staffService.getStaffStats(shopId, id, startDate, endDate);
    return { data: stats, message: 'ok' };
  }
}
