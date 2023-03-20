import { PaymentStatus } from "@app/interfaces";
import { UserEntity } from "../entities/user.entity";

export interface Pay {
  paymentLink: string;
  user: UserEntity;
}

export interface CheckPayment {
  user: UserEntity;
  status: PaymentStatus;
}

export interface CancelPayment {
  user: UserEntity;
}
