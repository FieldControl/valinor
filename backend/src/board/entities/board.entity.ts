import { Swimlane } from "src/swimlane/entities/swimlane.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToMany(() => User, (user) => user.boards)
  users: User[];

  @OneToMany(() => Swimlane, (board) => board.board)
  swimlanes: Swimlane[];
}