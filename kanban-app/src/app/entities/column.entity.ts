import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'columns' })
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Card, card => card.column)
  cards: Card[];
}