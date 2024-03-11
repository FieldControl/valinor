import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name:'badges'})
export class Badge{
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column({ name: 'name', length: 100, nullable: false })
    name: string;
    @Column({ name: 'color', length: 100, nullable: false })
    color: string;
    @CreateDateColumn({ name: 'created_at' })
    createdAt: string;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: string;
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: string;
}