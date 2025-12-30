import { Entity, PrimaryGeneratedColumn, Column as Col, ManyToOne, JoinColumn } from "typeorm";
import { Column } from "src/coluna/entities/coluna.entity";

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Col({ name: "titulo" })
  titulo: string;

  @Col()
  conteudo: string;

  @Col()
  colunaID: number;

  @ManyToOne(() => Column, (coluna) => coluna.cards, { onDelete: "CASCADE" })
  @JoinColumn({ name: "colunaID" })
  coluna: Column;
}
