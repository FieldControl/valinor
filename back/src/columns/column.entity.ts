import { Entity, PrimaryGeneratedColumn, Column as TypeOrmColumn, OneToMany } from 'typeorm'; 
import { Card } from '../cards/card.entity'; 

@Entity()
export class KanbanColumn { 
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn() 
  title: string;

  @TypeOrmColumn({ type: 'int', default: 0 }) 
  order: number;

  @OneToMany(() => Card, (card) => card.column)
  cards: Card[];
}
