import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'cards'})
export class Card {
  //id será incrementado
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ nullable: false })
    description: string;
  }
  
