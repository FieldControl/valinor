import {
  Entity,
  PrimaryGeneratedColumn,
  Column as DBColumn,
  OneToMany,
} from 'typeorm';
import { Card } from '../cards/cards.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Column {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @DBColumn()
  title: string;

  @Field(() => Number, { nullable: true })
  @DBColumn({ nullable: true })
  order?: number;

  @Field(() => [Card], { nullable: true })
  @OneToMany(() => Card, (card) => card.column, { cascade: true })
  cards: Card[];
}
