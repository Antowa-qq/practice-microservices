import { IsString } from 'class-validator';
import { IUser } from '@app/interfaces';

export namespace AccountUserInfo {
  // get-user-info maybe?
  export const topic = 'account.user-info.query';

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    user: Omit<IUser, 'passwordHash'>;
  }
}
