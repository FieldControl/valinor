import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CardEntity } from '../cards/card.entity';

@Entity('columns')
export class ColumnEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => CardEntity, (card) => card.column)
  cards: CardEntity[];
}
