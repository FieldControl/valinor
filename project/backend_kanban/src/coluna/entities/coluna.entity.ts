import { Entity, Column as Col, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Card } from "../../cards/entities/card.entity";

@Entity()
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @Col()
  titulo: string;

  @OneToMany(() => Card, (card) => card.coluna, { cascade: true })
  cards: Card[];
}
