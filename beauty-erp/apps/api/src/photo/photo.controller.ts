import { Controller, Get, Post, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { PhotoService } from './photo.service';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post()
  async create(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const photo = await this.photoService.create(shopId, body);
    return { data: photo, message: 'ok' };
  }

  @Get()
  async findByCustomer(
    @Headers('x-shop-id') shopId: string,
    @Query('customerId') customerId: string,
    @Query('type') type?: string,
  ) {
    const photos = await this.photoService.findByCustomer(shopId, customerId, type);
    return { data: photos, message: 'ok' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-shop-id') shopId: string) {
    const result = await this.photoService.delete(id, shopId);
    return { data: result, message: 'ok' };
  }
}
