import { AccountChangedCourse } from '@app/contracts';
import {
  IDomainEvent,
  IUser,
  IUserCourses,
  PurchaseState,
  UserRole,
} from '@app/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: string;
  displayName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourses[];
  events: IDomainEvent[] = [];

  constructor(user: IUser) {
    this._id = user._id;
    this.passwordHash = user.passwordHash;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;
    this.courses = user.courses;
  }

  public findUserCourse(courseId: string) {
    return this.courses.find((course) => course._id === courseId);
  }

  public addCourse(courseId: string) {
    const exist = this.findUserCourse(courseId);
    if (exist) {
      throw new Error('Курс уже существует');
    }
    this.courses.push({ courseId, purchaseState: PurchaseState.Started });
  }

  public deleteCourse(courseId: string) {
    this.courses = this.courses.filter((course) => course._id !== courseId);
  }

  public setCourseStatus(courseId: string, state: PurchaseState) {
    const exist = this.findUserCourse(courseId);
    if (!exist) {
      this.courses.push({
        courseId,
        purchaseState: PurchaseState.Started,
      });
      return this;
    }

    if (PurchaseState.Canceled === state) {
      this.deleteCourse(courseId);
      return this;
    }

    this.courses = this.courses.map((course) => {
      if (courseId === course._id) {
        return { ...course, purchaseState: state };
      }
      return course;
    });

    this.events.push({
      topic: AccountChangedCourse.topic,
      data: { courseId, userId: this._id, state },
    });
    return this;
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  public updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }
}
