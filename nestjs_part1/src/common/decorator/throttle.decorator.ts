import { Reflector } from '@nestjs/core';

export interface ThrottleOptions {
  count: number;
  unit: 'minute';
}

export const Throttle = Reflector.createDecorator<ThrottleOptions>();
