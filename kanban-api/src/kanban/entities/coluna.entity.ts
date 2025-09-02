import { Column as Col, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Quadro } from './quadro.entity';
import { Tarefa } from './tarefa.entity';

@Entity()
export class Coluna {
	@PrimaryGeneratedColumn('uuid') id: string;
	@Col() titulo: string;
	@Col({ default: 0 }) ordem: number;

	@ManyToOne(() => Quadro, q => q.colunas, { onDelete: 'CASCADE' })
	quadro: Quadro;

	@OneToMany(() => Tarefa, t => t.coluna, { cascade: true })
	tarefas: Tarefa[];
}