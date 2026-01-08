import { Entity, Column as Col, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Card } from "../../cards/entities/card.entity";

/**
 * Entidade Column (lista do kanban).
 */
@Entity()
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @Col()
  titulo: string;

  // Relação com cards; cascade permite operações em cascata
  @OneToMany(() => Card, (card) => card.coluna, { cascade: true })
  cards: Card[];
}
