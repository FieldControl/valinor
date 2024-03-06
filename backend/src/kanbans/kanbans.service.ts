import { Injectable } from '@nestjs/common';
import { Kanban } from './entities/kanban.entity';

@Injectable()
export class KanbansService {
  private array: Kanban[] = [];

  async create(createKanbanDto: Kanban) {
    return this.array.push(createKanbanDto);
  }

  async findAll() {
    return this.array;
  }

  findOne(id: string) {
    const existKanban = this.array.find(
      kanbans => kanbans.id === id
    );
    if (!existKanban) {
      throw new Error("Lista não existe: "+ id + " Json: " + JSON.stringify(this.array));
    }
    return existKanban;
  }

  async update(id: string, updateKanbanDto: Partial<Kanban>) {
    const kanban = this.findOne(id);
    Object.entries(updateKanbanDto).forEach(([key, value]) => {
      if (key === 'id') {
        return;
      }
      kanban[key] = value
    })
    return kanban;
  }

  async remove(id: string) {
    const kanban = this.findOne(id);
    this.array = this.array.filter(
      kanbanRemove => kanbanRemove.id !== id
    );
    return kanban;
  }
}
