import { Quadro } from '../../quadro/entities/quadro.entity';
import { Cartao } from '../../cartao/entities/cartao.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Coluna {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column()
  ordem: number;

  @Column()
  quadroId: number;

  @ManyToOne(() => Quadro, (quadro) => quadro.colunas)
  @JoinColumn()
  quadro: Quadro;

  @OneToMany(() => Cartao, (cartao) => cartao.coluna)
  cartoes: Cartao[];
}
