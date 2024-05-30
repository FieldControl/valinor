// cards/card.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ColumnEntity } from 'src/columns/entities/column.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column()
  title: string;

  @Column()
  description: string | null;


  @Column()
  color: string;
  
  //encontrei dificuldades em usar columnId entao decidi criar cardColumn como um seletor substituto
  @Column()
  cardColumn: string;

  @ManyToOne(() => ColumnEntity, colum => colum.cards)
  column: ColumnEntity;
}
