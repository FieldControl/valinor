import { Document } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import { Prop, Schema as NestSchema } from '@nestjs/mongoose';

export interface Subtask extends Document {
  name: string;
  task: string;
  isCompleted: boolean
}

@NestSchema()
export class Subtask {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  task: string;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const SubtaskSchema = SchemaFactory.createForClass(Subtask);
