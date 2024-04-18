import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Card } from 'src/cards/entities/card.entity';

export type ColumnDocument = HydratedDocument<Column>;

@Schema()
export class Column {
  @Prop()
  name: string;

  @Prop({type: mongoose.Schema.Types.Array, ref: "Card"})
  cards: Card[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);