import { Field, ObjectType } from "@nestjs/graphql";
import { IColumn } from "../interfaces/column.interface";
import { Task } from "src/modules/task/dtos/task.model";

@ObjectType()
export class Column extends IColumn {
  @Field(() => [Task], { nullable: true })
  tasks?: Task[]
}