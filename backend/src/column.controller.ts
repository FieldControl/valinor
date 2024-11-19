import { Controller, Get, Post, Body } from '@nestjs/common';
import { ColumnService } from './column/column.service';
import { Column } from './column/column.entity';

@Controller('columns')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  create(@Body() body: { name: string }): Promise<Column> {
    const columnData: Partial<Column> = { name: body.name };
    return this.columnService.create(columnData);
  }

  @Get()
  findAll(): Promise<Column[]> {
    return this.columnService.findAll();
  }
}
