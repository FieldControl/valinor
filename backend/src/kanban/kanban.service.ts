import { Injectable } from '@nestjs/common';
import { CreateKanbanDto } from './dto/create-kanban.dto';
import { UpdateKanbanDto } from './dto/update-kanban.dto';

@Injectable()
export class KanbanService {
  create(createKanbanDto: CreateKanbanDto) {
    return 'This action adds a new kanban';
  }

  findAll() {
    return `This action returns all kanban`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kanban`;
  }

  update(id: number, updateKanbanDto: UpdateKanbanDto) {
    return `This action updates a #${id} kanban`;
  }

  remove(id: number) {
    return `This action removes a #${id} kanban`;
  }
}
