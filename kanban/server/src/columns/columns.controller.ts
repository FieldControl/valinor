import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Controller('boards/:boardId/columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) { }

  @Get()
  findByBoard(@Param('boardId') boardId: string) {
    return this.columnsService.findByBoard(boardId);
  }

  @Post()
  create(@Param('boardId') boardId: string, @Body() dto: CreateColumnDto) {
    return this.columnsService.create(boardId, dto);
  }
}
