import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('card_entity')
export class CardEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({})
  columnId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
