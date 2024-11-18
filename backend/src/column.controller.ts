import { Controller, Get, Post, Body } from '@nestjs/common';
import { ColumnService } from './column/column.service';
import { Column } from './column/column.entity';

@Controller('columns')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  create(@Body('name') name: string): Promise<Column> {
    return this.columnService.create(name);
  }

  @Get()
  findAll(): Promise<Column[]> {
    return this.columnService.findAll();
  }
}
