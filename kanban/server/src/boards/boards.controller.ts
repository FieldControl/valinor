import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardService: BoardsService) {}

  @Get()
  findAll(){
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string){
    return this.boardService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBoardDto){
    return this.boardService.create(dto);
  }


  @Delete(':id')
  remove(@Param('id') id: string){
    return this.boardService.remove(id);
  }

}
