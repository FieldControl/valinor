import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  column!: string;

  @Column('simple-json', { default: [] })
  comments!: { id: number; content: string }[];
}
