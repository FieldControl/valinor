import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateTask {
  @Field()
  description: string;

  @Field()
  id_column: number;

  @Field({ nullable: true, defaultValue: false })
  deleted?: boolean
}