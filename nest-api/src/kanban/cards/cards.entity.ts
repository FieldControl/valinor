import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { ColumnTable } from '../columns/columns.entity';

@ObjectType()
@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  @Generated('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => ColumnTable, (columnTable: ColumnTable) => columnTable.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ColumnTableId' })
  columnsTable: ColumnTable;

  @ManyToOne(() => User, (user: User) => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'UserId' })
  user: User;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
