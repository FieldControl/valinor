import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Column } from "./column.entity";

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  columnId!: number;

  @ManyToOne(() => Column, column => column.cards)
  column!: Column;
}