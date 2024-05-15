import { Module } from '@nestjs/common';
import { TarefaService } from './tarefa.service';
import { TarefaController } from './tarefa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarefa } from './entities/tarefa.entity';

@Module({
  controllers: [TarefaController],
  providers: [TarefaService],
  imports: [TypeOrmModule.forFeature([Tarefa])],
})
export class TarefaModule {}
