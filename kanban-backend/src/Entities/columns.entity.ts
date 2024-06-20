import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Columns {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;
}
