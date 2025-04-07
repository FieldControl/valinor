import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('columns')
  getColumns() {
    return this.boardService.getColumns();
  }

  @Post('columns')
  createColumn(@Body() data: { title: string }) {
    return this.boardService.createColumn(data);
  }

  @Post('cards/:columnId')
  createCard(@Param('columnId') columnId: number, @Body() data: { title: string; description: string }) {
    return this.boardService.createCard(columnId, data);
  }
}
