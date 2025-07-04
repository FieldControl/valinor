import { Body, Controller, Post, Get, Patch, Param, Delete } from '@nestjs/common';
import { CreateColumnDTO } from './dto/create-column.dto';
import { ColumnService } from './column.service';
import { UpdateColumnDTO } from './dto/update-column.dto';

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
    @Body() UpdateColumnDTO: UpdateColumnDTO){
        return this.columnService.update(id, UpdateColumnDTO);
    }

    @Delete(':id')
    remove(@Param('id') id: string){
        return this.columnService.remove(id)
    }
}

