import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ColumnEntity } from './column.entity'; 

@Entity('cards') 
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' }) 
  description: string;

  @Column()
  order: number; 

  @ManyToOne(() => ColumnEntity, column => column.cards, {
    onDelete: 'CASCADE',
  })
  column: ColumnEntity; 
}