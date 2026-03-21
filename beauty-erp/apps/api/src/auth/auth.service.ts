import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

interface SocialProfile {
  provider: 'KAKAO' | 'NAVER';
  providerId: string;
  email?: string;
  name: string;
  phone?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    return user;
  }

  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('이미 등록된 이메일입니다');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        role: 'SHOP_OWNER',
        authProvider: 'EMAIL',
        passwordHash,
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(user: { id: string; email: string | null; role: string }) {
    return this.generateTokens(user.id, user.email, user.role);
  }

  private generateTokens(userId: string, email: string | null, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }

  // ── Social Login: Kakao ──────────────────────────────────────────

  getKakaoAuthUrl() {
    const clientId = this.config.get('KAKAO_CLIENT_ID', '');
    const redirectUri = this.config.get('KAKAO_REDIRECT_URI', '');
    if (!clientId || !redirectUri) {
      return { configured: false, url: null };
    }
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    return { configured: true, url };
  }

  async kakaoLogin(code: string) {
    const clientId = this.config.get('KAKAO_CLIENT_ID');
    const clientSecret = this.config.get('KAKAO_CLIENT_SECRET', '');
    const redirectUri = this.config.get('KAKAO_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      throw new BadRequestException('카카오 로그인이 설정되지 않았습니다');
    }

    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    });
    if (clientSecret) {
      tokenParams.append('client_secret', clientSecret);
    }

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      this.logger.error(`Kakao token exchange failed: ${JSON.stringify(tokenData)}`);
      throw new UnauthorizedException('카카오 인증에 실패했습니다');
    }

    // 2. Get user info
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    if (!userRes.ok) {
      throw new UnauthorizedException('카카오 사용자 정보를 가져올 수 없습니다');
    }

    const kakaoAccount = userData.kakao_account || {};
    const profile: SocialProfile = {
      provider: 'KAKAO',
      providerId: String(userData.id),
      email: kakaoAccount.email,
      name: kakaoAccount.profile?.nickname || '카카오 사용자',
      phone: kakaoAccount.phone_number,
    };

    // 3. Find or create user, return JWT
    return this.findOrCreateSocialUser(profile);
  }

  // ── Social Login: Naver ──────────────────────────────────────────

  getNaverAuthUrl() {
    const clientId = this.config.get('NAVER_CLIENT_ID', '');
    const redirectUri = this.config.get('NAVER_REDIRECT_URI', '');
    if (!clientId || !redirectUri) {
      return { configured: false, url: null };
    }
    const state = Math.random().toString(36).substring(2, 15);
    const url = `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    return { configured: true, url, state };
  }

  async naverLogin(code: string, state: string) {
    const clientId = this.config.get('NAVER_CLIENT_ID');
    const clientSecret = this.config.get('NAVER_CLIENT_SECRET');
    const redirectUri = this.config.get('NAVER_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException('네이버 로그인이 설정되지 않았습니다');
    }

    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      state,
    });

    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      this.logger.error(`Naver token exchange failed: ${JSON.stringify(tokenData)}`);
      throw new UnauthorizedException('네이버 인증에 실패했습니다');
    }

    // 2. Get user info
    const userRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    if (!userRes.ok || userData.resultcode !== '00') {
      throw new UnauthorizedException('네이버 사용자 정보를 가져올 수 없습니다');
    }

    const naverProfile = userData.response || {};
    const profile: SocialProfile = {
      provider: 'NAVER',
      providerId: naverProfile.id,
      email: naverProfile.email,
      name: naverProfile.name || naverProfile.nickname || '네이버 사용자',
      phone: naverProfile.mobile,
    };

    // 3. Find or create user, return JWT
    return this.findOrCreateSocialUser(profile);
  }

  // ── Social Login: Shared ─────────────────────────────────────────

  getSocialLoginStatus() {
    const kakaoConfigured = !!(this.config.get('KAKAO_CLIENT_ID', '') && this.config.get('KAKAO_REDIRECT_URI', ''));
    const naverConfigured = !!(this.config.get('NAVER_CLIENT_ID', '') && this.config.get('NAVER_CLIENT_SECRET', ''));
    return { kakao: kakaoConfigured, naver: naverConfigured };
  }

  private async findOrCreateSocialUser(profile: SocialProfile) {
    // Try to find existing user by email (if available)
    let user = profile.email
      ? await this.prisma.user.findUnique({ where: { email: profile.email } })
      : null;

    if (user) {
      // Update auth provider if user previously registered via email
      if (user.authProvider === 'EMAIL') {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { authProvider: profile.provider },
        });
      }
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: profile.email || null,
          name: profile.name,
          phone: profile.phone || null,
          role: 'SHOP_OWNER',
          authProvider: profile.provider,
        },
      });
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('인증이 만료되었습니다. 다시 로그인해주세요');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('인증이 만료되었습니다. 다시 로그인해주세요');
    }
  }
}
