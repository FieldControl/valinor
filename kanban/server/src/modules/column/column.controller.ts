import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnDTO } from './column.dto';

@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Get()
  async findAllColumns() {
    return this.columnService.findAllColumns();
  }

  @Get(':id')
  async getColumnById(@Param('id') id: string) {
    return this.columnService.getColumnById(id);
  }

  @Post()
  async createColumn(@Body() data: ColumnDTO) {
    const column = await this.columnService.createColumn(data);

    return column;
  }

  @Patch(':id')
  async updateColumn(@Param('id') id: string, @Body() data: ColumnDTO) {
    const column = await this.columnService.updateColumn(id, data);

    return column;
  }

  @Delete(':id')
  async deleteColumn(@Param('id') id: string) {
    const column = await this.columnService.deleteColumn(id);

    return column;
  }
}
