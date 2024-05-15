import { Injectable } from '@nestjs/common';
import { CreateTarefaDto } from './dto/create-tarefa.dto';
import { UpdateTarefaDto } from './dto/update-tarefa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tarefa } from './entities/tarefa.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TarefaService {
  constructor(
    @InjectRepository(Tarefa)
    private tarefaRepositorio: Repository<Tarefa>,
  ) {}

  /**
   * Validações podem ser adicionadas aqui explicitamente pq se a coluna que a gente quer vincular a tarefa
   * não existir ou o destinatario, não estará correto(e também não podemos confiar que o frontend vai sempre mandar os dados
   * corretos, pode ter algum bug ou alguém pode manipular o request antes de mandar.)
   */
  create(createTarefaDto: CreateTarefaDto) {
    const tarefa = new Tarefa();

    tarefa.titulo = createTarefaDto.titulo;
    tarefa.conteudo = createTarefaDto.conteudo;
    tarefa.destinatarioId = createTarefaDto.destinatarioId;
    tarefa.colunaId = createTarefaDto.colunaId;

    return this.tarefaRepositorio.save([tarefa]);
  }

  update(id: number, updateTarefaDto: UpdateTarefaDto) {
    return this.tarefaRepositorio.update(id, {
      titulo: updateTarefaDto.titulo,
      conteudo: updateTarefaDto.conteudo,
      destinatarioId: updateTarefaDto.destinatarioId,
      colunaId: updateTarefaDto.colunaId,
    });
  }

  remove(id: number) {
    return this.tarefaRepositorio.delete(
      {
        id: id
      }
    )
  }
}
