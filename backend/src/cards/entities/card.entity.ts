import { Kanban } from "src/kanbans/entities/kanban.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Badge } from "../../badges/entities/badge.entity";

@Entity({ name: 'cards' })
export class Card {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ManyToOne(() => Kanban, (kanban) => kanban.id)
    @JoinColumn({ name: "kanban_id" })
    kanban_id: string;
    @Column({ name: 'name', length: 100, nullable: false })
    title: string;
    @Column({ name: 'description', length: 255, nullable: true })
    description: string;
    @Column({ name: 'date_end', type: "datetime", nullable: true })
    date_end: Date
    @CreateDateColumn({ name: 'created_at' })
    createdAt: string;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: string;
    @ManyToMany(() => Badge)
    @JoinTable({ name: "cards_badges" })
    badges: Badge[]
}
