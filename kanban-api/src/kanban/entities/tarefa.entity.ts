import { Column as Col, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Coluna } from './coluna.entity';

@Entity()
export class Tarefa {
	@PrimaryGeneratedColumn('uuid') id: string;
	@Col() titulo: string;
	@Col({ nullable: true }) descricao?: string;
	@Col({ default: 0 }) ordem: number;

	@ManyToOne(() => Coluna, c => c.tarefas, { onDelete: 'CASCADE' })
	coluna: Coluna;
}