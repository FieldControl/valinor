import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from './card.entity';

@Entity()
export class KanbanColumn {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'int', nullable: false })
    position: number;

    @OneToMany(() => Card, (card) => card.column)
    cards: Card[];
}



