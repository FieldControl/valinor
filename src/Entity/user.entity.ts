import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { KanbanEntity } from "./kanban.entity";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @OneToMany(() => KanbanEntity, (kanban) => kanban.user )
  kanban: KanbanEntity[]
}