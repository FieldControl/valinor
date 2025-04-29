import { Entity, Column as TypeOrmColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Card } from '../../cards/entities/card.entity';
//Criação do objeto da coluna trabalhando com cards
@Entity('tb_coluna')
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn()
  nome: string;

  @OneToMany(() => Card, card => card.coluna, {
    eager: true,
    cascade: true
  })
  cards: Card[];
}