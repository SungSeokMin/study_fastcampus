import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { envVariablesKeys } from 'src/common/const/env.const';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async register(basicToken: string) {
    const { email, password } = this.parseBasicToken(basicToken);

    return this.userService.create({ email, password });
  }

  async login(basicToken: string) {
    const { email, password } = this.parseBasicToken(basicToken);

    const user = await this.authenticate(email, password);

    return {
      accessToken: await this.issueToken(user, false),
      refreshToken: await this.issueToken(user, true),
    };
  }

  async blockToken(token: string) {
    const payload = this.jwtService.decode(token);

    const expiryDate = +new Date(payload['exp'] * 1000);
    const now = +Date.now();

    const diff = (expiryDate - now) / 1000;
    const ttl = Math.max(diff * 1000, 1);

    await this.cacheManager.set(`BLOCK_TOKEN_${token}`, payload, ttl);

    return true;
  }

  issueToken(user: { id: number; role: Role }, isRefreshToken: boolean) {
    const accessTokenSecret = this.configService.get<string>(envVariablesKeys.accessTokenSecret);
    const refreshTokenSecret = this.configService.get<string>(envVariablesKeys.refreshTokenSecret);

    return this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '24h' : 300,
      },
    );
  }

  parseBasicToken(basicToken: string) {
    const basicSplit = basicToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
    }

    const [basic, token] = basicSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    const tokenSplit = decoded.split(':');

    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
    }

    const [email, password] = tokenSplit;

    return { email, password };
  }

  async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
    if (!rawToken) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    const [bearer, token] = basicSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(
          isRefreshToken ? envVariablesKeys.refreshTokenSecret : envVariablesKeys.accessTokenSecret,
        ),
      });

      if (isRefreshToken) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('Refresh 토큰을 입력 해주세요!');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('Access 토큰을 입력 해주세요!');
        }
      }

      return payload;
    } catch (e) {
      console.error(e);

      throw new UnauthorizedException('토큰이 만료됐습니다!');
    }
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    const passOk = bcrypt.compare(password, user.password);

    if (!passOk) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    return user;
  }
}
