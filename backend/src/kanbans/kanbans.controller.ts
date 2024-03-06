import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KanbansService } from './kanbans.service';
import { CreateKanbanDto } from './dto/create-kanban.dto';
import { UpdateKanbanDto } from './dto/update-kanban.dto';
import { Kanban } from './entities/kanban.entity';
import { v4 as uuid } from 'uuid';
import { ListKanbanDto } from './dto/list-kanban.dto';

@Controller('kanbans')
export class KanbansController {
  constructor(private readonly kanbansService: KanbansService) { }

  @Post()
  async create(@Body() createKanbanDto: CreateKanbanDto) {
    const kanban = new Kanban();
    kanban.name = createKanbanDto.name
    kanban.cards = createKanbanDto.cards
    kanban.id = uuid();
    this.kanbansService.create(kanban);
    return {
      kanban: new ListKanbanDto(kanban.id, kanban.name),
      message: "Lista Criada com sucesso !"
    };
  }

  @Get()
  findAll() {
    return this.kanbansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kanbansService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateKanbanDto: UpdateKanbanDto) {
    const kanban = await this.kanbansService.update(id, updateKanbanDto);
    return {
      kanban: kanban,
      message: "Lista atualizada com sucesso !"
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const kanban = await this.kanbansService.remove(id);

    return {
      kanban: kanban,
      message: "Lista deletada com sucesso !"
    }
  }
}