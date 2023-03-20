import { BuyCourseSaga } from './buy-course.saga';
import { Pay, CheckPayment, CancelPayment } from './interfaces';

export abstract class BuyCourseSagaState {
  public saga: BuyCourseSaga;

  public setContext(saga: BuyCourseSaga) {
    this.saga = saga;
  }

  public abstract pay(): Promise<Pay>;
  public abstract checkPayment(): Promise<CheckPayment>;
  public abstract cancel(): Promise<CancelPayment>;
}
