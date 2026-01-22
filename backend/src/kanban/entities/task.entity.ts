import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { 
  Column as DbColumn, 
  Entity, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { KanbanColumn } from './column.entity';

@ObjectType()
@Entity()
export class Task {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @DbColumn()
  title: string;

  // Isso aqui já serve para as suas "Notas"
  @Field({ nullable: true })
  @DbColumn({ nullable: true })
  description?: string;

  // --- NOVOS CAMPOS ADICIONADOS ---

  // Prazo Estipulado
  @Field({ nullable: true })
  @DbColumn({ nullable: true })
  dueDate?: Date;

  // Tempo de envio (Automático)
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  // Data de atualização (Bom para auditoria)
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // -------------------------------

  @Field(() => Int)
  @DbColumn({ default: 0 })
  order: number;

  @Field(() => KanbanColumn)
  @ManyToOne(() => KanbanColumn, (c) => c.tasks, { onDelete: 'CASCADE' })
  column: KanbanColumn;
}