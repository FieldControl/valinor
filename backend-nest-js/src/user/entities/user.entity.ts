//Criando uma coluna SQL para anmazenas dados do usuario
import { BeforeInsert, Column, Entity, JoinTable, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { ManyToMany } from "typeorm";
import { Board } from "src/board/entities/board.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstname: string;
    @Column()
    lastname: string;
    @Column()
    email: string;
    @Column()
    password: string;
    @Column( {default: false})
    emailVerified: boolean;

    @ManyToMany(() => Board, (board) =>board.users)
    @JoinTable()
    boards: Board[];

    //criptografando senha definida antes de enviar para o database
    @BeforeInsert()
    async hashPassword() {
        if (this.password){
            this.password = await bcrypt.hash(this.password, 10);
        }
    }
}
