import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema()
export class Token {
  @Prop()
  hash: string;

  @Prop()
  responsible: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);