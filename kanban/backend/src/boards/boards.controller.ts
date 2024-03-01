import { Controller, Get, Post, Body } from '@nestjs/common';
import { Board } from './board.entity';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  findAll(): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @Post()
  create(@Body() board: Board): Promise<Board> {
    return this.boardsService.create(board);
  }
}
