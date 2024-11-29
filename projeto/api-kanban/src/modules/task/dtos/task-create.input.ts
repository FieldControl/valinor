import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateTask {
  @Field()
  id_column: number;

  @Field()
  description: string;

  @Field({ nullable: true, defaultValue: false })
  deleted?: boolean
}