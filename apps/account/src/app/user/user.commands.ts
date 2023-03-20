import {
  AccountBuyCourse,
  AccountCheckPayment,
  AccountUserChangeProfile,
} from '@app/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { UserService } from './user.service';

// TODO swagger
@Controller()
export class UserCommands {
  constructor(private readonly userService: UserService) {}

  @RMQValidate()
  @RMQRoute(AccountUserChangeProfile.topic)
  async changeProfile(
    @Body() dto: AccountUserChangeProfile.Request
  ): Promise<AccountUserChangeProfile.Response> {
    return this.userService.changeProfile(dto);
  }

  @RMQValidate()
  @RMQRoute(AccountBuyCourse.topic)
  async buyCourse(
    @Body() dto: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    return this.userService.buyCourse(dto);
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  checkPayment(
    @Body() dto: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    return this.userService.checkPayment(dto);
  }
}
