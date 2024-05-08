import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Board } from 'src/boards/entities/board.entity';
import { Card } from 'src/cards/entities/card.entity';
import { User } from 'src/users/entities/user.entity';

export type ColumnDocument = HydratedDocument<Column>;

@Schema()
export class Column {
  @Prop()
  name: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: "Board"})
  board: Board;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: "User"})
  responsible: User;

  @Prop({type: mongoose.Schema.Types.Array, ref: "Card"})
  cards: Card[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);