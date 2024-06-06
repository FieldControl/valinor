import { Entity, PrimaryGeneratedColumn,OneToMany, Column, BeforeInsert, ManyToMany, JoinTable } from 'typeorm';
import * as bycript from 'bcrypt'
import { Quadro } from '../../quadro/entities/quadro.entity';
import { Card } from '../../card/entities/card.entity';

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    primeiroNome: string;
    
    @Column()
    ultimoNome: string;

    @Column()
    email: string;

    @Column()
    senha: string;

    @ManyToMany(() => Quadro, (quadro)=> quadro.usuario)
    @JoinTable()
    quadro: Quadro[];

    @OneToMany(() => Card, (usuario) => usuario.assigne)
    cards: Card[];

    @BeforeInsert()
    async hashPassword(){
        if(this.senha){
            this.senha = await bycript.hash(this.senha, 10);
        }
    }


}
