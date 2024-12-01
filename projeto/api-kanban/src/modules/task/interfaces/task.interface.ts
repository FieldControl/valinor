import { Field, ID, InterfaceType } from "@nestjs/graphql";

@InterfaceType()
export class ITask {
  @Field(() => ID)
  id: number

  @Field()
  id_column: number

  @Field()
  sequence: number;

  @Field()
  description: string

  @Field()
  deleted: boolean
}