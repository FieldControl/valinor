import { Entity, PrimaryGeneratedColumn, Column as TypeOrmColumn, OneToMany } from 'typeorm';
import { Card } from '../cards/entities/card.entity';
//Criação do objeto coluna

@Entity('tb_coluna')
export class Coluna {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn()
  nome: string;

  @OneToMany(() => Card, (card: Card) => card.coluna)
  cards: Card[];
}