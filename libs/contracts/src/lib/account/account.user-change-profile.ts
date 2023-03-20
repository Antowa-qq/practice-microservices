import { IsString } from 'class-validator';
import { IUser } from '@app/interfaces';

export namespace AccountUserChangeProfile {
  export const topic = 'account.user-change-profile.command';

  export class Request {
    @IsString()
    id: string;

    @IsString()
    user: Pick<IUser, 'displayName'>;
  }

  export class Response {}
}
