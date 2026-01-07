import { ObjectType, Field } from '@nestjs/graphql';
import { AuthUser } from '../dto/auth-user.dto';

@ObjectType()
export class AuthResponse {
  @Field()
  access_token: string;

  @Field(() => AuthUser)
  user: AuthUser;
}
