import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { ColumnEntity } from './column.entity';

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  column_id: number;

  @Column({ type: 'int', nullable: false })
  position: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  creation_date: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  change_date: Date;

  @ManyToOne(() => ColumnEntity, column => column.cards)
  column: ColumnEntity;
}
