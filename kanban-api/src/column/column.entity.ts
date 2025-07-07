
import {
  Entity,
  PrimaryGeneratedColumn,
  Column as OrmColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';

@ObjectType()
@Entity()
export class Column {
 
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  //coluna para ordem das colunas
  @Field({ nullable: true })
  @OrmColumn({ nullable: true })
  order?: number;

  @Field()
  @OrmColumn()
  title: string;

  @Field(() => Board)
  @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
  board: Board;

  @Field(() => [Card], { nullable: true })
  @OneToMany(() => Card, (card) => card.column, { cascade: true, eager: true })
  cards: Card[];
}
