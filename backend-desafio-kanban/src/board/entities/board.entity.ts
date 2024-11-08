import { Swimlane } from 'src/swimlane/entities/swimlane.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  idBoard: number;

  @Column({ length: 100 })
  nameBoard: string;

  @ManyToMany(() => User, (user) => user.boards, {
    onDelete: 'CASCADE',
  })
  users: User[];

  @OneToMany(() => Swimlane, (board) => board.board)
  swimlanes: Swimlane[];
}
