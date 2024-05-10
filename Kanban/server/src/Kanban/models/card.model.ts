import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Injectable } from '@nestjs/common';

export type CardDocument = Card & Document;
@Schema()
export class Card {
  @Prop()
  title: string;

  @Prop()
  description: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
