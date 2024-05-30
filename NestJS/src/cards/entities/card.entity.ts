import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";

const { nanoid } = require("nanoid")

@Entity('Cards')
export class Card {


    @PrimaryColumn()
    idCard:string;

    @Column()
    cli: string;

    
    @BeforeInsert()
    generateId() {
        this.idCard = `id_${nanoid()}`
    }
}
