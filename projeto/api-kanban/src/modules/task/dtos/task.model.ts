import { Field, ObjectType } from "@nestjs/graphql";
import { ITask } from "../interfaces/task.interface";
import { Column } from "src/modules/column/dtos/column.model";

@ObjectType()
export class Task extends ITask { }