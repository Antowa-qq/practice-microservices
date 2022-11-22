import { AccountLogin, AccountRegister } from '@app/contracts';
import { Body, Controller, Post } from '@nestjs/common';
import { RMQRoute } from 'nestjs-rmq';
import { AuthService } from './auth.service';

export class RegisterDto {
  email: string;
  password: string;
  displayName: string;
}

export class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RMQRoute(AccountRegister.topic)
  async register(
    @Body() dto: AccountRegister.Request
  ): Promise<AccountRegister.Response> {
    return this.authService.register(dto);
  }

  @RMQRoute(AccountLogin.topic)
  async login(
    @Body() { email, password }: AccountLogin.Request
  ): Promise<AccountLogin.Response> {
    const { id } = await this.authService.validateUser(email, password);
    return this.authService.login(id);
  }
}
