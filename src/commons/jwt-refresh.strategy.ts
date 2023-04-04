import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { Strategy } from 'passport-jwt';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie
          ? cookie.replace('refreshToken=', '')
          : null;
        return refreshToken;
      },
      secretOrKey: process.env.REFRESH_TOKEN_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const refreshCookie = req.headers.cookie;
    if (!refreshCookie) {
      throw new UnauthorizedException('유효하지 않은 refresh 토큰입니다.');
    }
    const refresh = req.headers['cookie'].replace('refreshToken=', '');
    const cache = await this.cacheManager.get(`refreshToken:${refresh}`);

    if (cache !== null) {
      throw new UnauthorizedException('로그아웃된 계정입니다.');
    }
    return {
      email: payload.email,
      id: payload.sub,
      role: payload.role,
    };
  }
}
