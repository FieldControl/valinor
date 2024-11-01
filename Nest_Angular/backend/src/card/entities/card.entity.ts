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
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column()
  conteudo: string;

  @Column()
  ordem: number;

  @Column({ nullable: true })
  responsavelId: number;

  @ManyToOne(() => User, (user) => user.cards)
  @JoinColumn()
  responsavel: User;

  @Column()
  swimlaneId: number;

  @ManyToOne(() => Swimlane, (swimlane) => swimlane.cards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  swimlane: Swimlane;
  
}
