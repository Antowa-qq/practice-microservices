import { IsEmail, IsString } from 'class-validator';

export namespace AccountBuyCourse {
  export const topic = 'account.buy-course.command';

  export class Request {
    @IsString()
    userId: string;

    @IsEmail()
    courseId: string;
  }

  export class Response {
    paymentLink: string;
  }
}
