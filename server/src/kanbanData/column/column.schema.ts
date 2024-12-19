import { Document } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import { Prop, Schema as NestSchema } from '@nestjs/mongoose';

export interface Column extends Document {
  name: string;
  color: string;
}

@NestSchema()
export class Column {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  color: string;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);