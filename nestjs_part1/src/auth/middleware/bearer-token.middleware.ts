import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariablesKeys } from 'src/common/const/env.const';
import { headerVariablesKeys } from 'src/common/const/headers.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers[headerVariablesKeys.authorization] as string;

    if (!authHeader) {
      return next();
    }

    const token = this.validateBearerToken(authHeader);

    const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`);

    if (blockedToken) {
      throw new UnauthorizedException('차단된 토큰입니다.');
    }

    const tokenKey = `TOKEN_${token}`;
    const cachedPayload = await this.cacheManager.get(tokenKey);

    if (cachedPayload) {
      req.user = cachedPayload;

      return next();
    }

    const decodedPayload = await this.jwtService.decode(token);

    if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    try {
      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariablesKeys.refreshTokenSecret
          : envVariablesKeys.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });

      const expiryDate = +new Date(payload['exp'] * 1000);
      const now = +Date.now();

      const diff = (expiryDate - now) / 1000;
      const ttl = Math.max((diff - 30) * 1000, 1);

      await this.cacheManager.set(tokenKey, payload, ttl);

      req.user = payload;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료됐습니다.');
      }

      next();
    }
  }

  validateBearerToken(bearerToken: string) {
    const bearerSplit = bearerToken.split(' ');

    if (bearerSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
    }

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
    }

    return token;
  }
}
