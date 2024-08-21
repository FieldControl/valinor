import {
    BeforeInsert,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from 'bcrypt';
import { Quadro } from "../../quadro/entities/quadro.entity";
import { Cartao } from "../../cartao/entities/cartao.entity";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    primeiroNome: string;

    @Column({ length: 100 })
    sobrenome: string;

    @Column({ length: 100 })
    email: string;

    @Column({ length: 200 })
    senha: string;

    @Column({ default: false })
    emailVerificado: boolean;

    @ManyToMany(() => Quadro, (quadro) => quadro.usuarios)
    @JoinTable()
    quadros: Quadro[];

    @OneToMany(() => Cartao, (usuario) => usuario.atribuir)
    cartoes: Cartao[];

    @BeforeInsert()
    async hashPassword() {
        if (this.senha) {
            this.senha = await bcrypt.hash(this.senha, 10);
        }
    }
}

