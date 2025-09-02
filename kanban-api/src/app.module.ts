import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quadro } from './kanban/entities/quadro.entity';
import { Coluna } from './kanban/entities/coluna.entity';
import { Tarefa } from './kanban/entities/tarefa.entity';
import { KanbanModule } from './kanban/kanban.module';

@Module({
	imports: [
		// Configuração do banco de dados SQLite
		TypeOrmModule.forRoot({
			type: 'sqlite',
			database: 'kanban.db',
			entities: [Quadro, Coluna, Tarefa],
			synchronize: true,
			logging: true, // Adiciona logs para debug
		}),
		
		// Módulo do Kanban com todas as funcionalidades
		KanbanModule,
	],
})
export class AppModule {}