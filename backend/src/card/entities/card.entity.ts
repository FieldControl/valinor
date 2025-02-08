import { Column as ColumnEntity } from 'src/column/entities/column.entity';
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
  name: string;

  @Column({ nullable: true })
  content: string;

  @Column()
  order: number;

  @Column()
  columnId: number;

  @ManyToOne(() => ColumnEntity, (column) => column.cards)
  @JoinColumn()
  column: ColumnEntity;
}
