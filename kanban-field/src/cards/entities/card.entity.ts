import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
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
  dueDate: Date

  @Prop({type: mongoose.Schema.Types.Array, ref: "User"})
  responsibles: User[]

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: "Column"}) // Referência à coluna
  column: string

  @Prop()
  position: number;

  constructor(card?: Partial<Card>) {
    this.name = card?.name
    this.description = card?.description
    this.createdAt = card?.createdAt
    this.dueDate = card?.dueDate
    this.responsibles = card?.responsibles
    this.column = card?.column
    this.position = card?.position
  }
}

export const CardSchema = SchemaFactory.createForClass(Card);