import { Document } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import { Prop, Schema as NestSchema } from '@nestjs/mongoose';

export interface Task extends Document {
  name: string;
  description: string;
  status: string;
}

@NestSchema()
export class Task {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  status: string;  // Nome da coluna em que a task está
}

export const TaskSchema = SchemaFactory.createForClass(Task);