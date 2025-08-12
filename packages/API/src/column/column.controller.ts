import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ColumnService } from './column.service';

@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) { }

  @Get()
  async getColumns(): Promise<any[]> {
    return await this.columnService.getColumnsWithCards();
  }

  @Post()
  create(@Body() body: { name: string; order: number }) {
    return this.columnService.createColumn(body);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.columnService.deleteColumn(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: { name?: string; order?: number }) {
    return this.columnService.updateColumn(id, body);
  }

}
