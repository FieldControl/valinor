import { InputType } from '@nestjs/graphql';

@InputType()
export class AuthInput {
  email: string;
  password: string;
}
