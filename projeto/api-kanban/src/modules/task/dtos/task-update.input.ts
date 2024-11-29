import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateTask {
  @Field()
  id: number;

  @Field({ nullable: true })
  id_column?: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true, defaultValue: false })
  deleted?: boolean
}