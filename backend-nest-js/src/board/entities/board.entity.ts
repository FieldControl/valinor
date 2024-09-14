//Criando uma coluna SQL para anmazenas dados do usuario
import { Columns } from "src/column/entities/column.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Board {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @ManyToMany(() => User, (user) =>user.boards, {
        onDelete: 'CASCADE',
    })
    users: User[];

    @OneToMany(() => Columns, (columns) => columns.board)
    columns: Columns[];

}
