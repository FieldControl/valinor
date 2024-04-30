import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Card } from 'src/cards/entities/card.entity';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;
  
  @Prop()
  password: string;

  @Prop({type: mongoose.Schema.Types.Array, ref: "Card"})
  cards: Card[];

  @Prop( {default: Date.now} )
  creation: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);