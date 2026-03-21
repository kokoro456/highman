import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string; phone?: string },
  ) {
    const tokens = await this.authService.register(body);
    return { data: tokens, message: 'ok' };
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req: { user: { id: string; email: string | null; role: string } }) {
    const tokens = await this.authService.login(req.user);
    return { data: tokens, message: 'ok' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    const tokens = await this.authService.refreshTokens(body.refreshToken);
    return { data: tokens, message: 'ok' };
  }

  // ── Social Login: Kakao ──────────────────────────────────────────

  @Public()
  @Get('kakao')
  getKakaoAuthUrl() {
    const result = this.authService.getKakaoAuthUrl();
    return { data: result, message: 'ok' };
  }

  @Public()
  @Post('kakao/callback')
  @HttpCode(HttpStatus.OK)
  async kakaoCallback(@Body() body: { code: string }) {
    const tokens = await this.authService.kakaoLogin(body.code);
    return { data: tokens, message: 'ok' };
  }

  // ── Social Login: Naver ──────────────────────────────────────────

  @Public()
  @Get('naver')
  getNaverAuthUrl() {
    const result = this.authService.getNaverAuthUrl();
    return { data: result, message: 'ok' };
  }

  @Public()
  @Post('naver/callback')
  @HttpCode(HttpStatus.OK)
  async naverCallback(@Body() body: { code: string; state: string }) {
    const tokens = await this.authService.naverLogin(body.code, body.state);
    return { data: tokens, message: 'ok' };
  }

  // ── Social Login Status ──────────────────────────────────────────

  @Public()
  @Get('social/status')
  getSocialLoginStatus() {
    const status = this.authService.getSocialLoginStatus();
    return { data: status, message: 'ok' };
  }
}
