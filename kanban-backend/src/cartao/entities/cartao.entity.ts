import { Coluna } from '../../coluna/entities/coluna.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Cartao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column()
  conteudo: string;

  @Column()
  ordem: number;

  @Column({ nullable: true })
  atribuidoId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.cartoes)
  @JoinColumn()
  atribuir: Usuario;

  @Column()
  colunaId: number;

  @ManyToOne(() => Coluna, (coluna) => coluna.cartoes)
  @JoinColumn()
  coluna: Coluna;


  @Column({ length: 7, default: '#ffffff' }) 
  cor: string;
}