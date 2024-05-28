import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";

const { nanoid } = require("nanoid")

@Entity('Cards')
export class Card {


    @PrimaryColumn()
    idCard:string;

    @Column()
    negociacao:string;

    @Column()
    concluida:string;

    @Column()
    entrega:string;

    @Column()
    cli: string;

    @Column()
    venda: string;

    @BeforeInsert()
    generateId() {
        this.idCard = `id_${nanoid()}`
    }
}
