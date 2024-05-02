import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { ColumnEntity } from './column.entity';

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => ColumnEntity, column => column.cards)
  column: ColumnEntity;
}
