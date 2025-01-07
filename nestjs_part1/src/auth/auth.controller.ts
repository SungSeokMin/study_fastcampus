import {
  ClassSerializerInterceptor,
  Controller,
  Headers,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { headerVariablesKeys } from 'src/common/const/headers.const';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // authorization: Basic $token
  @Post('register')
  registerUser(@Headers(headerVariablesKeys.authorization) basicToken: string) {
    return this.authService.register(basicToken);
  }

  // authorization: Basic $token
  @Post('login')
  loginUser(@Headers(headerVariablesKeys.authorization) basicToken: string) {
    return this.authService.login(basicToken);
  }

  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }
}
