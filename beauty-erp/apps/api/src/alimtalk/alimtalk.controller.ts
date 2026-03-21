import { Controller, Get, Post, Body } from '@nestjs/common';
import { AlimtalkService } from './alimtalk.service';

@Controller('alimtalk')
export class AlimtalkController {
  constructor(private readonly alimtalkService: AlimtalkService) {}

  @Get('status')
  getStatus() {
    return { data: this.alimtalkService.getStatus(), message: 'ok' };
  }

  @Post('test')
  async sendTest(
    @Body() body: { phone: string; customerName?: string; shopName?: string },
  ) {
    const result = await this.alimtalkService.sendBookingConfirmation(
      body.phone,
      {
        customerName: body.customerName || '테스트 고객',
        shopName: body.shopName || '테스트 매장',
        serviceName: '테스트 서비스',
        dateTime: new Date().toLocaleString('ko-KR'),
        staffName: '테스트 담당자',
      },
    );
    return { data: result, message: 'ok' };
  }
}
