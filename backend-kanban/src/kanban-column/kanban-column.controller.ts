import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { KanbanColumnService } from './kanban-column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';


@Controller('kanban-columns') 
export class KanbanColumnController {
    constructor(private readonly kanbanColumnService: KanbanColumnService) {}

    @Post()
    async create(@Body() createColumnDto: CreateColumnDto) {
    console.log('📥 Dados recebidos no Controller:',    createColumnDto);
    return this.kanbanColumnService.create(createColumnDto);
}



    @Get()
    findAll() {
        return this.kanbanColumnService.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.kanbanColumnService.remove(id);
    }
}
