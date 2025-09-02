import { Column as Col, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Coluna } from './coluna.entity';

@Entity()
export class Quadro {
	@PrimaryGeneratedColumn('uuid') id: string;
	@Col() nome: string;

	@OneToMany(() => Coluna, c => c.quadro, { cascade: true })
	colunas: Coluna[];
}