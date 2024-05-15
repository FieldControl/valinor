import { PartialType } from '@nestjs/mapped-types';
import { CreateTarefaDto } from './create-tarefa.dto';

export class UpdateTarefaDto extends PartialType(CreateTarefaDto) {}
