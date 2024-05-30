import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
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

  constructor(user?: Partial<User>) {
    this.name = user?.name
    this.email = user?.email
    this.password = user?.password
    this.cards = user?.cards
    this.creation = user?.creation
  }
}

export const UserSchema = SchemaFactory.createForClass(User);