import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm'; // Adicione ManyToMany e JoinTable
import { ColumnEntity } from './column.entity';
import { User } from './user.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User, user => user.ownedBoards, { eager: true, onDelete: 'CASCADE' }) 
  owner: User;

  @Column({ nullable: true }) 
  ownerId: number;

  
  @ManyToMany(() => User, user => user.boardsAsMember) 
  @JoinTable({ 
    name: 'board_members', 
    joinColumn: { name: 'board_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  members: User[]; 

  @OneToMany(() => ColumnEntity, column => column.board, { cascade: true })
  columns: ColumnEntity[];
}