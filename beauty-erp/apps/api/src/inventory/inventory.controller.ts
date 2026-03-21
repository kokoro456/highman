import { Controller, Get, Post, Put, Body, Param, Query, Headers } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll(
    @Headers('x-shop-id') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
  ) {
    const result = await this.inventoryService.findAll(shopId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      lowStockOnly: lowStockOnly === 'true',
    });
    return { ...result, message: 'ok' };
  }

  @Post()
  async create(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const item = await this.inventoryService.create(shopId, body);
    return { data: item, message: 'ok' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Headers('x-shop-id') shopId: string, @Body() body: any) {
    const item = await this.inventoryService.update(id, shopId, body);
    return { data: item, message: 'ok' };
  }

  @Post(':id/log')
  async addLog(@Param('id') id: string, @Headers('x-shop-id') shopId: string, @Body() body: any) {
    const log = await this.inventoryService.addLog(id, shopId, body);
    return { data: log, message: 'ok' };
  }

  @Get(':id/logs')
  async getLogs(
    @Param('id') id: string,
    @Headers('x-shop-id') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.inventoryService.getLogs(id, shopId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return { ...result, message: 'ok' };
  }
}
