import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@Body('title') title: string) {
    return this.boardsService.create(title);
  }

  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(+id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.boardsService.delete(+id);
  }
}
