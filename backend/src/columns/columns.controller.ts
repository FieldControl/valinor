import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.create(createColumnDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateColumnDto: CreateColumnDto) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Get()
  index() {
    return this.columnsService.index();
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.columnsService.delete(id);
  }
}
