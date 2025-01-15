import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Throttle, ThrottleOptions } from '../decorator/throttle.decorator';
import { tap } from 'rxjs';

@Injectable()
export class ThrottleInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();

    const userId = request?.user?.sub;

    if (!userId) {
      return next.handle();
    }

    const throttleOptions = this.reflector.get<ThrottleOptions>(Throttle, context.getHandler());

    if (!throttleOptions) {
      return next.handle();
    }

    const minute = new Date().getMinutes();

    const key = `${request.method}_${request.path}_${userId}_${minute}`;

    const count = await this.cacheManager.get<number>(key);

    if ((count && count) > throttleOptions.count) {
      throw new ForbiddenException('요청 가능 횟수를 초과했습니다.');
    }

    return next.handle().pipe(
      tap(async () => {
        const count = (await this.cacheManager.get<number>(key)) ?? 0;

        await this.cacheManager.set(key, count + 1, 60000);
      }),
    );
  }
}
