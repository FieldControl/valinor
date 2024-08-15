import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Swimlane } from '../../swimlane/entities/swimlane.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  content: string;

  @Column()
  order: number;

  @Column({ nullable: true })
  assigneId: number;

  @ManyToOne(() => Swimlane, swimlane => swimlane.cards, { onDelete: 'CASCADE' })
  @JoinColumn()
  swimlane: Swimlane;
}
