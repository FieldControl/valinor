import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Column } from "src/columns/entities/column.entity";
import { User } from "src/users/entities/user.entity";

export type BoardDocument = HydratedDocument<Board>;

@Schema()
export class Board {
  @Prop()
  name: string

  @Prop({type: mongoose.Schema.Types.Array, ref: "Column"})
  columns: Column[]

  @Prop({type: mongoose.Schema.Types.Array, ref: "User"})
  responsibles: string[]

  constructor(board?: Partial<Board>) {
    this.name = board?.name
    this.columns = board?.columns
    this.responsibles = board?.responsibles
  }

}

export const BoardSchema = SchemaFactory.createForClass(Board);