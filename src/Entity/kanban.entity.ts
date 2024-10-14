import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


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
}

export enum KanbanStatus {
  OPEN = 'OPEN',
  INPROGRESS = 'INPROGRESS',
  COMPLETED = 'COMPLETED'
}