import { Field, InputType } from "@nestjs/graphql";
import { UpdateTask } from "src/modules/task/dtos/task-update.input";
import { Task } from "src/modules/task/dtos/task.model";

@InputType()
export class UpdateColumn {
  @Field()
  id: number;

  @Field({ nullable: true })
  sequence?: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [UpdateTask], { nullable: true })
  tasks?: UpdateTask[];
}