// task.model.ts

import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Definição do esquema para o modelo de tarefa
@Schema()
export class Task extends Document {
  // Propriedade para armazenar a descrição da tarefa, é obrigatória
  @Prop({ required: true })
  description: string;
}

// Criação do esquema baseado na classe Task
export const TaskSchema = SchemaFactory.createForClass(Task);
