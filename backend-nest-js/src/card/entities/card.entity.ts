//Criando uma coluna SQL para anmazenas dados do usuario
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    content: string;

    @Column()
    DelegateId : number;

    @ManyToOne(() => User, (user) => user.card)
    @JoinColumn()
    delegate: string;
}
