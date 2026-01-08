import { Entity, PrimaryGeneratedColumn, Column as Col, ManyToOne, JoinColumn } from "typeorm";
import { Column } from "src/coluna/entities/coluna.entity";

/**
 * Entidade Card (Tabela de cartões).
 * Observação: mantém `colunaID` e também a relação ManyToOne com `coluna`.
 */
@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Col({ name: "titulo" })
  titulo: string;

  @Col()
  conteudo: string;

  // ColunaFK direta (duplicada junto com a relação abaixo)
  @Col()
  colunaID: number;

  @ManyToOne(() => Column, (coluna) => coluna.cards, { onDelete: "CASCADE" })
  @JoinColumn({ name: "colunaID" })
  coluna: Column;
}
