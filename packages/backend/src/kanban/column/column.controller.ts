import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { Column } from 'src/interfaces/column.interface';

@Controller('columns')
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Get('query')
  async getAllColumns(
    @Query('project_id') projectId: string,
  ): Promise<Column[]> {
    return this.columnService.getAllColumns(projectId);
  }

  @Get('query')
  async getByIdColumn(
    @Query('project_id') projectId: string,
    @Query('column_id') columnId: string,
  ): Promise<Column> {
    return this.columnService.getByIdColumns(projectId, columnId);
  }

  @Post()
  async createColumn(@Body() bodyReq: Column): Promise<Column[]> {
    return this.columnService.createColumn(bodyReq);
  }

  @Put('query')
  async updateTitleColumn(
    @Query('column_id') columnId: string,
    @Body() body: Column,
  ): Promise<Column[]> {
    return this.columnService.renameColumn(columnId, body);
  }

  @Delete('query')
  async deleteColumn(@Query('column_id') columnId: string): Promise<Column[]> {
    return this.columnService.deleteColumn(columnId);
  }
}
