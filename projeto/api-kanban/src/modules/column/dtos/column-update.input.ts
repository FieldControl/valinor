import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateColumn {
  @Field({ nullable: true })
  description?: string;
} 