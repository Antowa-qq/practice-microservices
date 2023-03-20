import { PurchaseState } from '@app/interfaces';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseSagaState } from './buy-course.state';
import {
  BuyCourseStateCanceled,
  BuyCourseStatePurchased,
  BuyCourseStateStarted,
  BuyCourseStateWaitingForPayment,
} from './buy-course.steps';

export class BuyCourseSaga {
  private state: BuyCourseSagaState;

  constructor(
    public user: UserEntity,
    public courseId: string,
    public rmqService: RMQService
  ) {}

  getState() {
    return this.state;
  }

  setState(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        this.state = new BuyCourseStateStarted();
        break;
      case PurchaseState.WaitingForPayment:
        this.state = new BuyCourseStateWaitingForPayment();
        break;
      case PurchaseState.Purchased:
        this.state = new BuyCourseStatePurchased();
        break;
      case PurchaseState.Canceled:
        this.state = new BuyCourseStateCanceled();
        break;
    }
    this.state.setContext(this);
    this.user.setCourseStatus(courseId, state);
  }
}
