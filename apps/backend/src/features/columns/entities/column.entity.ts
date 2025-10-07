import {
  Entity,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Card } from '../../cards/entities/card.entity';

@Entity('columns')
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeOrmColumn({ type: 'varchar', length: 100 })
  title: string;

  @TypeOrmColumn({ type: 'text', nullable: true })
  description: string;

  @TypeOrmColumn({ type: 'int', default: 0 })
  position: number;

  @TypeOrmColumn({ type: 'varchar', length: 7, default: '#3B82F6' })
  color: string;

  @OneToMany(() => Card, (card) => card.column, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  cards: Card[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
