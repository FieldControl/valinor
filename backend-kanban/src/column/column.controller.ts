import { Body, Controller, Post, Get, Patch, Param, Delete } from '@nestjs/common';
import { CreateColumnDTO } from './dto/create-column.dto';
import { ColumnService } from './column.service';
import { UpdateCardDTO } from 'src/card/dto/update-card.dto';

@Controller('column')
export class ColumnController {
constructor(private readonly columnService: ColumnService){}

    @Post()
    create(@Body() createColumnDTO: CreateColumnDTO){
        return this.columnService.create(createColumnDTO)
    }

    @Get()
    findAll(){
        return this.columnService.findAll();
    }

    @Patch(':id')
    update(@Param('id') id: string,
    @Body() updateCardDTO: UpdateCardDTO){
        return this.columnService.update(id, updateCardDTO);
    }

    @Delete(':id')
    remove(@Param('id') id: string){
        return this.columnService.remove(id)
    }
}

