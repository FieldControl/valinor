// src/entities/card.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ColumnEntity } from './column.entity'; // Importe a entidade ColumnEntity

@Entity('cards') // Define o nome da tabela
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' }) // Descrição é opcional
  description: string;

  @Column()
  order: number; // Para definir a ordem dos cartões na coluna

  @ManyToOne(() => ColumnEntity, column => column.cards, {
    onDelete: 'CASCADE',
  })
  column: ColumnEntity; // Um Card pertence a uma ColumnEntity
}
