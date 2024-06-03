import { Card } from 'src/card/entities/card.entity';
import { Quadro } from 'src/quadro/entities/quadro.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Coluna {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  ordem: number;

  @Column()
  quadroId: number;

  @ManyToOne(() => Quadro, (quadro) => quadro.colunas ,{ onDelete: 'CASCADE' })
  @JoinColumn()
  quadro: Quadro;

  @OneToMany(() => Card, (card) => card.coluna)
  cards: Card[];
}
