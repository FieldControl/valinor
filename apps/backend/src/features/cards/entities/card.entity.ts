import {
  Entity,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Column as KanbanColumn } from '../../columns/entities/column.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn({ type: 'varchar', length: 200 })
  title: string;

  @TypeOrmColumn({ type: 'text', nullable: true })
  description: string;

  @TypeOrmColumn({ type: 'int', default: 0 })
  position: number;

  @TypeOrmColumn({ type: 'varchar', length: 7, default: '#FFFFFF' })
  color: string;

  @TypeOrmColumn({ type: 'varchar', length: 20, default: 'low' })
  priority: 'low' | 'medium' | 'high';

  @ManyToOne(() => KanbanColumn, (column) => column.cards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'columnId' })
  column: KanbanColumn;

  @TypeOrmColumn()
  columnId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
