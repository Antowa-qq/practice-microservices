import { IsString } from 'class-validator';
import { IUserCourses } from '@app/interfaces';

export namespace AccountUserCourses {
  // get-user-courses maybe?
  export const topic = 'account.user-courses.query';

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    courses: IUserCourses[];
  }
}
