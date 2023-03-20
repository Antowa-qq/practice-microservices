import { AccountUserInfo, AccountUserCourses } from '@app/contracts';
import { Body, Controller } from '@nestjs/common';
import { RMQValidate, RMQRoute } from 'nestjs-rmq';
import { UserRepository } from './repositories/user.repository';

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async getUserInfo(
    @Body() dto: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    // todo public profile + contract
    const user = await this.userRepository.findUserById(dto.id);
    return { user };
  }

  @RMQValidate()
  @RMQRoute(AccountUserCourses.topic)
  async getUserCourses(
    @Body() dto: AccountUserCourses.Request
  ): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(dto.id);
    return { courses: user.courses };
  }
}
