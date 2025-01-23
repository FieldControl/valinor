import { Controller, Get, Post, Body } from '@nestjs/common';
import { ColumnService } from './column.service';

@Controller('columns')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Get()
  findAll() {
    return this.columnService.findAll();
  }

  @Post()
  create(@Body() body: { title: string }) {
    const { title } = body;  
    return this.columnService.create(title);
  }
}
