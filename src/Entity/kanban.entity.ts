import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";


@Entity('kanban')
export class KanbanEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: KanbanStatus;

  @ManyToOne(() => UserEntity, (user) => user.kanban)
  user: UserEntity

  @Column()
  userId: number;
  
}

export enum KanbanStatus {
  OPEN = 'OPEN',
  INPROGRESS = 'INPROGRESS',
  COMPLETED = 'COMPLETED'
}