import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dtos/create-column.dto';
import { EditColumnDto } from './dtos/edit-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  async createColumn(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.createColumn(createColumnDto);
  }

  @Get()
  async listColumns() {
    return this.columnsService.listColumns();
  }

  @Delete('/:id')
  async deleteColumn(@Param('id') columnId: string) {
    await this.columnsService.deleteColumn(Number(columnId));
  }

  @Patch('/:id')
  async editColumn(
    @Param('id') columnId: string,
    @Body() editColumnDto: EditColumnDto,
  ) {
    return await this.columnsService.editColumn(
      Number(columnId),
      editColumnDto,
    );
  }
}
