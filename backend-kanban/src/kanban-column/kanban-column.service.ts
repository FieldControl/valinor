import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn } from '../entities/kanban-column.entity'; 
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class KanbanColumnService {
  constructor(
    @InjectRepository(KanbanColumn)
    private kanbanColumnRepository: Repository<KanbanColumn>,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<KanbanColumn> {
    const column = this.kanbanColumnRepository.create({
      title: createColumnDto.title,
      position: createColumnDto.position ?? 0, 
    });
    return this.kanbanColumnRepository.save(column);
  }

  async findAll(): Promise<KanbanColumn[]> {
    return this.kanbanColumnRepository.find();
  }

  async remove(id: string): Promise<void> {
    await this.kanbanColumnRepository.delete(id);
  }
}

