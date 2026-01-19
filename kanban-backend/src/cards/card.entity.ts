import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ColumnEntity } from '../columns/column.entity';

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'text', 
  })
  priority: string;

  @ManyToOne(() => ColumnEntity, (column) => column.cards, {
    onDelete: 'CASCADE',
  })
  column: ColumnEntity;
}
