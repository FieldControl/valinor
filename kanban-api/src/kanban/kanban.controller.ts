import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CriarQuadroDto } from './dto/criar-quadro.dto';
import { CriarColunaDto } from './dto/criar-coluna.dto';
import { CriarTarefaDto } from './dto/criar-tarefa.dto';

@Controller('kanban')
export class KanbanController {
	constructor(private readonly service: KanbanService) {}

	// Cria um novo quadro
	@Post('quadros') 
	criarQuadro(@Body() dto: CriarQuadroDto) { 
		return this.service.criarQuadro(dto); 
	}

	// Busca todos os quadros
	@Get('quadros') 
	buscarQuadros() { 
		return this.service.buscarQuadros(); 
	}

	// Busca um quadro específico
	@Get('quadros/:id') 
	buscarQuadro(@Param('id') id: string) { 
		return this.service.buscarQuadro(id); 
	}

	// Remove um quadro
	@Delete('quadros/:id') 
	excluirQuadro(@Param('id') id: string) { 
		return this.service.excluirQuadro(id); 
	}

	// Cria uma nova coluna
	@Post('colunas') 
	criarColuna(@Body() dto: CriarColunaDto) { 
		return this.service.criarColuna(dto); 
	}

	// Atualiza uma coluna
	@Patch('colunas/:id') 
	atualizarColuna(@Param('id') id: string, @Body() dados: any) { 
		return this.service.atualizarColuna(id, dados); 
	}

	// Remove uma coluna
	@Delete('colunas/:id') 
	excluirColuna(@Param('id') id: string) { 
		return this.service.excluirColuna(id); 
	}

	// Cria uma nova tarefa
	@Post('tarefas') 
	criarTarefa(@Body() dto: CriarTarefaDto) { 
		return this.service.criarTarefa(dto); 
	}

	// Atualiza uma tarefa
	@Patch('tarefas/:id') 
	atualizarTarefa(@Param('id') id: string, @Body() dados: any) { 
		return this.service.atualizarTarefa(id, dados); 
	}

	// Remove uma tarefa
	@Delete('tarefas/:id') 
	excluirTarefa(@Param('id') id: string) { 
		return this.service.excluirTarefa(id); 
	}

	// Move uma tarefa entre colunas
	@Post('tarefas/:id/mover') 
	mover(@Param('id') id: string, @Body() dados: { paraColunaId: string; paraOrdem: number }) {
		return this.service.moverTarefa(id, dados.paraColunaId, dados.paraOrdem);
	}
}