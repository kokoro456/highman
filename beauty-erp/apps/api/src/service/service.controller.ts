import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import { ServiceService } from './service.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Public()
  @Get('public/categories')
  async publicCategories(@Query('shopId') shopId: string) {
    if (!shopId) throw new BadRequestException('shopId is required');
    const categories = await this.serviceService.findCategories(shopId);
    return { data: categories, message: 'ok' };
  }

  @Public()
  @Get('public')
  async publicServices(@Query('shopId') shopId: string) {
    if (!shopId) throw new BadRequestException('shopId is required');
    const services = await this.serviceService.findServices(shopId);
    return { data: services, message: 'ok' };
  }

  @Post('categories')
  async createCategory(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const category = await this.serviceService.createCategory(shopId, body);
    return { data: category, message: 'ok' };
  }

  @Get('categories')
  async findCategories(@Headers('x-shop-id') shopId: string) {
    const categories = await this.serviceService.findCategories(shopId);
    return { data: categories, message: 'ok' };
  }

  @Post()
  async createService(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const service = await this.serviceService.createService(shopId, body);
    return { data: service, message: 'ok' };
  }

  @Get()
  async findServices(@Headers('x-shop-id') shopId: string) {
    const services = await this.serviceService.findServices(shopId);
    return { data: services, message: 'ok' };
  }

  @Put(':id')
  async updateService(@Param('id') id: string, @Headers('x-shop-id') shopId: string, @Body() body: any) {
    const service = await this.serviceService.updateService(id, shopId, body);
    return { data: service, message: 'ok' };
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    await this.serviceService.deleteService(id, shopId);
    return { data: null, message: 'ok' };
  }
}
