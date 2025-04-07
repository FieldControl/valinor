import { Entity, PrimaryGeneratedColumn, Column as DBColumn, OneToMany } from 'typeorm';
import { Card } from '../card/card.entity';

@Entity()
export class BoardColumn {  // <-- Altere "Column" para "BoardColumn"
  @PrimaryGeneratedColumn()
  id: number;

  @DBColumn()
  title: string;

  @OneToMany(() => Card, (card) => card.column)
  cards: Card[];
}

