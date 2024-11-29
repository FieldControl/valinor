import { ObjectType } from "@nestjs/graphql";
import { IColumn } from "../interfaces/column.interface";

@ObjectType()
export class Column extends IColumn { }