import { Controller, Get } from '@nestjs/common';
import { TarefaService } from '../services/tarefa.service';

@Controller('tarefas')
export class TarefaController {
  constructor(private readonly tarefaService: TarefaService) {}

  @Get()
  getAllTarefas() {
    return this.tarefaService.getAllTarefas();
  }
}