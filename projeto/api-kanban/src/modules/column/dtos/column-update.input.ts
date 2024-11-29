import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateColumn {
  @Field()
  id: number;

  @Field({ nullable: true })
  description?: string;
} 