import {
  AccountBuyCourse,
  AccountCheckPayment,
  AccountUserChangeProfile,
} from '@app/contracts';
import { Injectable } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEventEmitter } from './user.event-emitter';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmitter: UserEventEmitter
  ) {}

  async changeProfile(
    dto: AccountUserChangeProfile.Request
  ): Promise<AccountUserChangeProfile.Response> {
    const { id, user } = dto;
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) {
      throw new Error('Такого пользователя не существует');
    }
    const userEntity = new UserEntity(existedUser).updateProfile(
      user.displayName
    );
    await this.updateUser(userEntity);
    return { user };
  }

  async buyCourse(
    dto: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    const { courseId, userId } = dto;
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new Error('Такого пользователя нету');
    }
    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
    const { paymentLink, user } = await saga.getState().pay();
    await this.updateUser(user);
    return { paymentLink };
  }

  async checkPayment(
    dto: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    const { courseId, userId } = dto;
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new Error('Такого пользователя нету');
    }
    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();
    await this.updateUser(user);
    return { status };
  }

  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userRepository.updateUser(user),
      this.userEventEmitter.handle(user),
    ]);
  }
}
