import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm'; 
import { Board } from './board.entity'; 

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  
  @OneToMany(() => Board, board => board.owner) 
  ownedBoards: Board[];

  
  @ManyToMany(() => Board, board => board.members) 
  boardsAsMember: Board[];
}