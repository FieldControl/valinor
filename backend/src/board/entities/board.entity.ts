import { Column as ColumnEntity } from 'src/column/entities/column.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => ColumnEntity, (board) => board.board)
  columns: ColumnEntity[];
}
