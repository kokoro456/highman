import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  async create(
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    const shop = await this.shopService.create(userId, body);
    return { data: shop, message: 'ok' };
  }

  @Get()
  async findMyShops(@CurrentUser('sub') userId: string) {
    const shops = await this.shopService.findByOwner(userId);
    return { data: shops, message: 'ok' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const shop = await this.shopService.findById(id);
    return { data: shop, message: 'ok' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const shop = await this.shopService.update(id, body);
    return { data: shop, message: 'ok' };
  }
}
