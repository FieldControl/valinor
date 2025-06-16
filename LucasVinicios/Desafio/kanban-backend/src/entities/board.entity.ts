// src/entities/board.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm'; // Adicione ManyToMany e JoinTable
import { ColumnEntity } from './column.entity';
import { User } from './user.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // Proprietário do Board (relação um-para-muitos: um usuário pode ser owner de muitos boards)
  @ManyToOne(() => User, user => user.ownedBoards, { eager: true, onDelete: 'CASCADE' }) // 'ownedBoards' será a nova propriedade no User
  owner: User;

  @Column({ nullable: true }) // Permite que seja nulo temporariamente se autenticação estiver desativada
  ownerId: number;

  // Membros do Board (relação muitos-para-muitos: um board tem muitos membros, um membro pertence a muitos boards)
  @ManyToMany(() => User, user => user.boardsAsMember) // 'boardsAsMember' será a nova propriedade no User
  @JoinTable({ // Opcional: Personaliza o nome da tabela intermediária
    name: 'board_members', // Nome da tabela de junção
    joinColumn: { name: 'board_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  members: User[]; // Lista de usuários que são membros do board

  @OneToMany(() => ColumnEntity, column => column.board, { cascade: true })
  columns: ColumnEntity[];
}