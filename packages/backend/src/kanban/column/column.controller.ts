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
import { HandleMessage } from 'src/interfaces/handleMessage.interface';

@Controller('columns')
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Get('query')
  async getAllColumns(
    @Query('project_id') projectId: string,
  ): Promise<Column[] | HandleMessage> {
    return this.columnService.getAllColumns(projectId);
  }

  @Get('column/query')
  async getByIdColumn(
    @Query('column_id') columnId: string,
  ): Promise<Column | HandleMessage> {
    return this.columnService.getByIdColumns(columnId);
  }

  @Post()
  async createColumn(@Body() bodyReq: Column): Promise<HandleMessage> {
    return this.columnService.createColumn(bodyReq);
  }

  @Put('query')
  async updateTitleColumn(
    @Query('column_id') columnId: string,
    @Body() body: Column,
  ): Promise<HandleMessage> {
    return this.columnService.renameColumn(columnId, body);
  }

  @Delete('query')
  async deleteColumn(
    @Query('column_id') columnId: string,
  ): Promise<HandleMessage> {
    return this.columnService.deleteColumn(columnId);
  }
}
