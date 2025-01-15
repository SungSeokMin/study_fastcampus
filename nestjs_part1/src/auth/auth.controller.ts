import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Headers,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { headerVariablesKeys } from 'src/common/const/headers.const';
import { Public } from './decorator/public.decorator';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // authorization: Basic $token
  @Public()
  @Post('register')
  registerUser(@Headers(headerVariablesKeys.authorization) basicToken: string) {
    return this.authService.register(basicToken);
  }

  // authorization: Basic $token
  @Public('public')
  @Post('login')
  loginUser(@Headers(headerVariablesKeys.authorization) basicToken: string) {
    return this.authService.login(basicToken);
  }

  @Post('token/block')
  blockToken(@Body('token') token: string) {
    return this.authService.blockToken(token);
  }

  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }
}
