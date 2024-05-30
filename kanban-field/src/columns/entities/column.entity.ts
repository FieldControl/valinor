import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Board } from 'src/boards/entities/board.entity';
import { Card } from 'src/cards/entities/card.entity';
import { User } from 'src/users/entities/user.entity';

export type ColumnDocument = HydratedDocument<Column>;

@Schema()
export class Column {
  @Prop()
  name: string

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: "Board"})
  board: string

  @Prop({type: mongoose.Schema.Types.Array, ref: "User"})
  responsibles: User[]

  @Prop({type: mongoose.Schema.Types.Array, ref: "Card"})
  cards: Card[]

  constructor(column?: Partial<Column>) {
    this.name = column?.name
    this.board = column?.board
    this.responsibles = column?.responsibles
    this.cards = column?.cards
  }
}

export const ColumnSchema = SchemaFactory.createForClass(Column);