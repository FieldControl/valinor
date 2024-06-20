import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tasks {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  columnId: string;
}
