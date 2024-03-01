import { Controller, Get, Post, Body } from '@nestjs/common';
import { Column } from './column.entity';
import { ColumnsService } from './columns.service';

@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Get()
  findAll(): Promise<Column[]> {
    return this.columnsService.findAll();
  }

  @Post()
  create(@Body() column: Column): Promise<Column> {
    return this.columnsService.create(column);
  }
}
