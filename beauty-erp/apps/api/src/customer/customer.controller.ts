import { Controller, Get, Post, Put, Body, Param, Query, Headers } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const customer = await this.customerService.create(shopId, body);
    return { data: customer, message: 'ok' };
  }

  @Get()
  async findAll(
    @Headers('x-shop-id') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.customerService.findAll(shopId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    });
    return { ...result, message: 'ok' };
  }

  @Get(':id/tier')
  async getCustomerTier(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    const tier = await this.customerService.getCustomerTier(id, shopId);
    return { data: tier, message: 'ok' };
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    const customer = await this.customerService.findById(id, shopId);
    return { data: customer, message: 'ok' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Headers('x-shop-id') shopId: string, @Body() body: any) {
    const customer = await this.customerService.update(id, shopId, body);
    return { data: customer, message: 'ok' };
  }

  @Post('treatments')
  async addTreatment(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const history = await this.customerService.addTreatmentHistory(shopId, body);
    return { data: history, message: 'ok' };
  }
}
