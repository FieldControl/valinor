import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';
import { Quadro } from './entities/quadro.entity';
import { Coluna } from './entities/coluna.entity';
import { Tarefa } from './entities/tarefa.entity';

// Organiza e conecta todos os componentes (entidades, service, controller)
@Module({
	// Registra as entidades no TypeORM para operações de banco
	imports: [TypeOrmModule.forFeature([Quadro, Coluna, Tarefa])],
	
	// Controladores que expõem as rotas da API
	controllers: [KanbanController],
	
	// Serviços que contêm a lógica de negócio
	providers: [KanbanService],
})
export class KanbanModule {}