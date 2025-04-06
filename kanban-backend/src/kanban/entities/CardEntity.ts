// Criando a entidade CardEntity será responsável por representar os cartões do kanban
// e suas propriedades no banco de dados.

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('card_entity')
export class CardEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({})
  columnId: number; // Pelo id da coluna será detectado a qual coluna o card pertence,
  //  haverá apenas 3 colunas, então não é necessário uma tabela coluna
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
