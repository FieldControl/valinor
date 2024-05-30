
import { Entity, OneToMany, PrimaryGeneratedColumn, Column } from "typeorm";
import { ColumnEntity} from "src/columns/entities/column.entity";



@Entity()
export class Board {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string

    @OneToMany(() => ColumnEntity, colum => colum.board)
    columns: ColumnEntity[]

}

