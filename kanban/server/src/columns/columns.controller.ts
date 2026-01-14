import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller()
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) { }

  @Get('boards/:boardId/columns')
  findByBoard(@Param('boardId') boardId: string) {
    return this.columnsService.findByBoard(boardId);
  }

  @Post('boards/:boardId/columns')
  create(@Param('boardId') boardId: string, @Body() dto: CreateColumnDto) {
    return this.columnsService.create(boardId, dto);
  }

  @Patch('columns/:id')
  update(@Param('id') id: string, @Body() dto: UpdateColumnDto){
    return this.columnsService.update(id, dto);
  }

  @Delete('columns/:id')
  remove(@Param('id') id: string){
    return this.columnsService.remove(id);
  }
}
