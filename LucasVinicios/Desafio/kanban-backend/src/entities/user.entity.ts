// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm'; // Adicione ManyToMany
import { Board } from './board.entity'; // Importe a entidade Board

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // Boards que o usuário é o proprietário
  @OneToMany(() => Board, board => board.owner) // 'owner' é a propriedade de volta na entidade Board
  ownedBoards: Board[];

  // Boards que o usuário é membro (relação muitos-para-muitos)
  @ManyToMany(() => Board, board => board.members) // 'members' é a propriedade de volta na entidade Board
  boardsAsMember: Board[];
}