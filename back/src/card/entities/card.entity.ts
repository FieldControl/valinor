import { Coluna } from '../../colunas/entities/coluna.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  conteudo: string;

  @Column()
  ordem: number;

  @Column({ nullable: true })
  assigneId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.cards)
  @JoinColumn()
  assigne: Usuario;

  @Column()
  colunaId: number;

  @ManyToOne(() => Coluna, (coluna) => coluna.cards,  { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  coluna: Coluna;
}