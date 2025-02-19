import { Controller, Body, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { columnDTO } from './columns.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('COLUMNS')
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  async create(@Body() data: columnDTO){
    return await this.columnsService.create(data);
  }

  @Get()
  async findAll(){
    return await this.columnsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number){
    return await this.columnsService.findById(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: columnDTO){
    return await this.columnsService.update(Number(id), data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number){
    return await this.columnsService.delete(Number(id));
  }
}
