import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Card } from 'src/cards/entities/card.entity';

export type ColumnDocument = HydratedDocument<Column>;

@Schema()
export class Column {
  @Prop()
  name: string;

  @Prop({ref: "Card"})
  cards: Card[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);