import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { MembershipService } from './membership.service';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  // ==================== CARDS ====================

  @Post('cards')
  async createCard(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const card = await this.membershipService.createCard(shopId, body);
    return { data: card, message: 'ok' };
  }

  @Get('cards')
  async findCards(
    @Headers('x-shop-id') shopId: string,
    @Query('customerId') customerId: string,
  ) {
    const cards = await this.membershipService.findCards(shopId, customerId);
    return { data: cards, message: 'ok' };
  }

  @Post('cards/:id/use')
  async useCard(
    @Param('id') id: string,
    @Headers('x-shop-id') shopId: string,
    @Body() body: any,
  ) {
    const usage = await this.membershipService.useCard(id, shopId, body);
    return { data: usage, message: 'ok' };
  }

  @Post('cards/:id/charge')
  async chargeCard(
    @Param('id') id: string,
    @Headers('x-shop-id') shopId: string,
    @Body() body: any,
  ) {
    const card = await this.membershipService.chargeCard(id, shopId, body);
    return { data: card, message: 'ok' };
  }

  // ==================== POINTS ====================

  @Post('points/earn')
  async earnPoints(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const transaction = await this.membershipService.earnPoints(shopId, body);
    return { data: transaction, message: 'ok' };
  }

  @Post('points/spend')
  async spendPoints(@Headers('x-shop-id') shopId: string, @Body() body: any) {
    const transaction = await this.membershipService.spendPoints(shopId, body);
    return { data: transaction, message: 'ok' };
  }

  @Get('points')
  async getPointHistory(
    @Headers('x-shop-id') shopId: string,
    @Query('customerId') customerId: string,
  ) {
    const history = await this.membershipService.getPointHistory(shopId, customerId);
    return { data: history, message: 'ok' };
  }

  @Get('points/balance')
  async getPointBalance(
    @Headers('x-shop-id') shopId: string,
    @Query('customerId') customerId: string,
  ) {
    const result = await this.membershipService.getPointBalance(shopId, customerId);
    return { data: result, message: 'ok' };
  }
}
