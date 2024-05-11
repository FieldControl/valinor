import { Body, Controller, Delete, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { ColumnService } from '../service/column.service';
import { Column } from '../model/column.model';

@Controller('api/column')
export class ColumnController {

  constructor(private readonly columnService: ColumnService) {}

  @Post('/create')
  async createColumn(@Body('title') title: string) {
    return this.columnService.createColumn(title);
  }

  @Get()
  async getAllColumns(): Promise<Column[]> {
    return this.columnService.getColumns();
  }

  @Put(':id/updateTitle')
  async updateColumnTitle(@Param('id') columnId: number, @Body('title') title: string): Promise<Column> {
    return this.columnService.updateColumnTitle(columnId, title);
  }

}
