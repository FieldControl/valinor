import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Column as Coluna } from '../../columns/entities/columns.entity';  
//Criação do objeto dos cards 

@Entity('tb_card')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  descricao: string;

  @Column({ nullable: false })
  colunaId: number;

  @ManyToOne(() => Coluna, coluna => coluna.cards, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'colunaId' })
  coluna: Coluna;
}