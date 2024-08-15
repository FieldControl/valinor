import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Swimlane } from '../../swimlane/entities/swimlane.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => Swimlane, swimlane => swimlane.board, { cascade: true })
  swimlanes: Swimlane[];
}
