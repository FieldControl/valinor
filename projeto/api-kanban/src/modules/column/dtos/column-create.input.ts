import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateColumn {
  @Field()
  description: string;
  
  @Field({ nullable: true, defaultValue: false })
  deleted?: boolean
} 