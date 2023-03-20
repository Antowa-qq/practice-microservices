import { PaymentStatus } from '@app/interfaces';
import { IsEmail, IsString } from 'class-validator';

export namespace AccountCheckPayment {
  export const topic = 'account.check-payment.command';

  export class Request {
    @IsString()
    userId: string;

    @IsEmail()
    courseId: string;
  }

  export class Response {
    status: PaymentStatus;
  }
}
