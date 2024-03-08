import { Card } from "src/cards/entities/card.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'kanbans'})
export class Kanban {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({name: 'name', length: 100, nullable: false})
    name:string;
    @CreateDateColumn({ name: 'created_at' })
    createdAt: string;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: string;
    @OneToMany(() => Card, (card) => card.kanban_id)
    cards: Card[]
}
