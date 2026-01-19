import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get()
  findAll() {
    return this.columnsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateColumnDto) {
    return this.columnsService.create(dto);
  }
  @Delete(':id')
  deleteColumn(@Param('id') id: string) {
    return this.columnsService.delete(Number(id));
  }
}
