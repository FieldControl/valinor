import { BeforeInsert, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Board } from 'src/boards/entities/board.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    email: string;
    password: string;
    @OneToMany(() => Board, (board) => board.user)
    boards: Board[];
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    async hashPassword(): Promise<void> {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}