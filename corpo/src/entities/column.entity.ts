import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Card } from '../entities/card.entity';

@Entity()
export class BoardColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Card, card => card.column, { cascade: true}) 
  cards: Card[];
}