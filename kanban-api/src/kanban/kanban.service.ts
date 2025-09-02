import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quadro } from './entities/quadro.entity';
import { Coluna } from './entities/coluna.entity';
import { Tarefa } from './entities/tarefa.entity';
import { CriarQuadroDto } from './dto/criar-quadro.dto';
import { CriarColunaDto } from './dto/criar-coluna.dto';
import { CriarTarefaDto } from './dto/criar-tarefa.dto';

@Injectable()
export class KanbanService {
	constructor(
		@InjectRepository(Quadro) private quadros: Repository<Quadro>,
		@InjectRepository(Coluna) private colunas: Repository<Coluna>,
		@InjectRepository(Tarefa) private tarefas: Repository<Tarefa>,
	) {}

	// Cria um novo quadro
	criarQuadro(dto: CriarQuadroDto) { 
		return this.quadros.save(this.quadros.create(dto)); 
	}

	// Busca todos os quadros com colunas e tarefas
	buscarQuadros() { 
		return this.quadros.find({ relations: ['colunas', 'colunas.tarefas'] }); 
	}

	// Busca um quadro específico
	buscarQuadro(id: string) { 
		return this.quadros.findOne({ where: { id }, relations: ['colunas', 'colunas.tarefas'] }); 
	}

	// Remove um quadro
	excluirQuadro(id: string) { 
		return this.quadros.delete(id); 
	}

	// Cria uma nova coluna em um quadro
	async criarColuna(dto: CriarColunaDto) {
		const quadro = await this.quadros.findOneBy({ id: dto.quadroId });
		if (!quadro) throw new NotFoundException('Quadro não encontrado');
		
		return this.colunas.save(this.colunas.create({ 
			titulo: dto.titulo, 
			ordem: dto.ordem, 
			quadro 
		}));
	}

	// Atualiza dados de uma coluna
	atualizarColuna(id: string, dados: Partial<Coluna>) { 
		return this.colunas.update(id, dados); 
	}

	// Remove uma coluna
	excluirColuna(id: string) { 
		return this.colunas.delete(id); 
	}

	// Cria uma nova tarefa em uma coluna
	async criarTarefa(dto: CriarTarefaDto) {
		const coluna = await this.colunas.findOneBy({ id: dto.colunaId });
		if (!coluna) throw new NotFoundException('Coluna não encontrada');
		
		return this.tarefas.save(this.tarefas.create({ 
			titulo: dto.titulo, 
			descricao: dto.descricao, 
			ordem: dto.ordem, 
			coluna 
		}));
	}

	// Atualiza dados de uma tarefa
	atualizarTarefa(id: string, dados: Partial<Tarefa>) { 
		return this.tarefas.update(id, dados); 
	}

	// Remove uma tarefa
	excluirTarefa(id: string) { 
		return this.tarefas.delete(id); 
	}

	// Move uma tarefa de uma coluna para outra (drag & drop)
	async moverTarefa(tarefaId: string, paraColunaId: string, paraOrdem: number) {
		const tarefa = await this.tarefas.findOne({ 
			where: { id: tarefaId }, 
			relations: ['coluna'] 
		});
		if (!tarefa) throw new NotFoundException('Tarefa não encontrada');
		
		const colunaDestino = await this.colunas.findOneBy({ id: paraColunaId });
		if (!colunaDestino) throw new NotFoundException('Coluna destino não encontrada');
		
		tarefa.coluna = colunaDestino;
		tarefa.ordem = paraOrdem;
		
		return this.tarefas.save(tarefa);
	}
}