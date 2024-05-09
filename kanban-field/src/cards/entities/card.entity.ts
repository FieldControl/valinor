import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Column } from 'src/columns/entities/column.entity';
import { User } from 'src/users/entities/user.entity';

export type CardDocument = HydratedDocument<Card>;

@Schema()
export class Card {
  @Prop()
  name: string

  @Prop()
  description: string

  @Prop({default: Date.now})
  createdAt: Date

  @Prop()
  dueDate: string

  @Prop({type: mongoose.Schema.Types.Array, ref: "User"})
  responsibles: User[]

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: "Column"}) // Referência à coluna
  column: string
}

export const CardSchema = SchemaFactory.createForClass(Card);