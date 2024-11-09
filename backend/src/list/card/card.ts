/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

enum Status {
  TODO = "to-do",
  DESENVOLVENDO = "doing",
  COMPLETO = "complete",
}


@Schema()
export class Card extends Document {
  @Prop({ enum: Status, default: Status.TODO })
  status: Status;


  @Prop({ required: true })
  title: string;

  @Prop({})
  desc: string;
}

export const cardSchema = SchemaFactory.createForClass(Card);
