// src/entities/column.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Board } from './board.entity'; // Importe a entidade Board
import { Card } from './card.entity'; // Importe a entidade Card

@Entity('columns') // Define o nome da tabela
export class ColumnEntity {
  // Renomeado para evitar conflito com 'Column' do TypeORM
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  order: number; // Para definir a ordem das colunas no quadro

  @ManyToOne(() => Board, board => board.columns, { onDelete: 'CASCADE' })
  board: Board; // Uma Column pertence a uma Board

  @OneToMany(() => Card, card => card.column, { cascade: true })
  cards: Card[]; // Uma Column tem muitos Cards
}
