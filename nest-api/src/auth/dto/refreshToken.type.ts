import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RefreshTokenType {
  @Field()
  token: string;
}
