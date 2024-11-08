import { Swimlane } from 'src/swimlane/entities/swimlane.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  idCard: number;

  @Column({ length: 100 })
  nameCard: string;

  @Column({ length: 100 })
  content: string;

  @Column()
  order: number;

  @Column()
  userCod: number;

  @ManyToOne(() => User, (user) => user.cards)
  @JoinColumn()
  assigne: User;

  @Column()
  swimlaneCod: number;

  @ManyToOne(() => Swimlane, (swimlane) => swimlane.cards)
  @JoinColumn()
  swimlane: Swimlane;
}
