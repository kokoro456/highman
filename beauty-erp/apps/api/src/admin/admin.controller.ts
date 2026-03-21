import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    const stats = await this.adminService.getPlatformStats();
    return { data: stats, message: 'ok' };
  }

  @Get('shops')
  async getShops(@Query('search') search?: string) {
    const shops = await this.adminService.getShopList(search);
    return { data: shops, message: 'ok' };
  }

  @Get('shops/:id')
  async getShopDetail(@Param('id') id: string) {
    const shop = await this.adminService.getShopDetail(id);
    return { data: shop, message: 'ok' };
  }
}
