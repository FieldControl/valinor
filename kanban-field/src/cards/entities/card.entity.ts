import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

export type CardDocument = HydratedDocument<Card>;

@Schema()
export class Card {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  dueDate: Date;

  @Prop()
  responsible: User;
}

export const CardSchema = SchemaFactory.createForClass(Card);