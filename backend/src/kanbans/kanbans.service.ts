import { Injectable } from '@nestjs/common';
import { Kanban } from './entities/kanban.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListKanbanDto } from './dto/list-kanban.dto';
import { Card } from '../cards/entities/card.entity';
// import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class KanbansService {
  constructor(
    @InjectRepository(Kanban)
    private readonly kanbanRepository: Repository<Kanban>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>
  ){}

  async create(createKanbanDto: Kanban) {
    return await this.kanbanRepository.save(createKanbanDto)
  }

  async findAll() {
    const lists = await this.kanbanRepository.find({
      order: {createdAt:'ASC'}
    })
    const responseLists = lists.map(
      (list) => new ListKanbanDto(list.id, list.name)
    )

    return responseLists;
  }

  async findOne(id: string) {
    const kanban = await this.kanbanRepository.findOne({where: {id: id},relations: ['cards']});
    return kanban;
  }

  async update(id: string, updateKanbanDto: Partial<Kanban>) {
    return await this.kanbanRepository.update(id,updateKanbanDto);
  }

  async remove(id: string) {
    try {
      const kanban = await this.findOne(id);
      console.log(kanban.cards)
      for (const card of kanban.cards) {
        await this.cardRepository.delete(card.id)
      }
      await this.kanbanRepository.delete(id);
      return kanban
    } catch (error) {
      console.error("Erro ao remover lista: ",error)
    }
  }
}
