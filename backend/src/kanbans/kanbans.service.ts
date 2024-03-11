import { Injectable } from '@nestjs/common';
import { Kanban } from './entities/kanban.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListKanbanDto } from './dto/list-kanban.dto';
// import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class KanbansService {
  constructor(
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>
  ){}

  async create(createKanbanDto: Kanban) {
    return await this.kanbanRepository.save(createKanbanDto)
  }

  async findAll() {
    const lists = await this.kanbanRepository.find()
    const responseLists = lists.map(
      (list) => new ListKanbanDto(list.id, list.name)
    )

    return responseLists;
  }

  async findOne(id: string) {
    const kanban = await this.kanbanRepository.findOne({where: {id: id}});
    return kanban;
  }

  async update(id: string, updateKanbanDto: Partial<Kanban>) {
    return await this.kanbanRepository.update(id,updateKanbanDto);
  }

  async remove(id: string) {
    const kanban = await this.findOne(id);
    await this.kanbanRepository.delete(id);
    return kanban
  }
}
