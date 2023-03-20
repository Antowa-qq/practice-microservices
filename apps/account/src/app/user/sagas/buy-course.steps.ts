import {
  CourseGetCourse,
  PaymentCheck,
  PaymentGenerateLink,
} from '@app/contracts';
import { PaymentStatus, PurchaseState } from '@app/interfaces';
import { BuyCourseSagaState } from './buy-course.state';
import { CancelPayment, CheckPayment, Pay } from './interfaces';

export class BuyCourseStateStarted extends BuyCourseSagaState {
  public async pay(): Promise<Pay> {
    const { course } = await this.saga.rmqService.send<
      CourseGetCourse.Request,
      CourseGetCourse.Response
    >(CourseGetCourse.topic, {
      id: this.saga.courseId,
    });

    if (!course) {
      throw new Error('Курса не существует');
    }

    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchased, course._id);
      return { paymentLink: null, user: this.saga.user };
    }

    const { paymentLink } = await this.saga.rmqService.send<
      PaymentGenerateLink.Request,
      PaymentGenerateLink.Response
    >(PaymentGenerateLink.topic, {
      courseId: course._id,
      sum: course.price,
      userId: this.saga.user._id,
    });

    this.saga.setState(PurchaseState.WaitingForPayment, course._id);
    return { paymentLink, user: this.saga.user };
  }

  public checkPayment(): Promise<CheckPayment> {
    throw new Error('Нельзя проверить платёж, который не начался');
  }

  public async cancel(): Promise<CancelPayment> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return { user: this.saga.user };
  }
}

export class BuyCourseStateWaitingForPayment extends BuyCourseSagaState {
  public pay(): Promise<Pay> {
    throw new Error('Оплата курса уже в процессе');
  }

  public async checkPayment(): Promise<CheckPayment> {
    const { status } = await this.saga.rmqService.send<
      PaymentCheck.Request,
      PaymentCheck.Response
    >(PaymentCheck.topic, {
      courseId: this.saga.courseId,
      userId: this.saga.user._id,
    });
    if (status === PaymentStatus.canceled) {
      this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
      return { user: this.saga.user, status };
    }

    if (status === PaymentStatus.success) {
      this.saga.setState(PurchaseState.Purchased, this.saga.courseId);
      return { user: this.saga.user, status };
    }

    return { user: this.saga.user, status };
  }

  public async cancel(): Promise<CancelPayment> {
    throw new Error('Нельзя отменить платёж в процессе');
  }
}

export class BuyCourseStatePurchased extends BuyCourseSagaState {
  public pay(): Promise<Pay> {
    throw new Error('Нельзя оплатить купленный курс');
  }

  public checkPayment(): Promise<CheckPayment> {
    throw new Error('Нельзя проверить платёж по купленному курсу');
  }

  public cancel(): Promise<CancelPayment> {
    throw new Error('Нельзя отменить купленный курс');
  }
}

export class BuyCourseStateCanceled extends BuyCourseSagaState {
  public pay(): Promise<Pay> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId);
    return this.saga.getState().pay();
  }

  public checkPayment(): Promise<CheckPayment> {
    throw new Error('Нельзя проверить платёж по купленному курсу');
  }

  public cancel(): Promise<CancelPayment> {
    throw new Error('Нельзя отменить отмененный курс');
  }
}
