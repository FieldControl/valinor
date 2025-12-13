import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

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

  @Put()
  update(@Param('id') id: string, @Body() dto: UpdateBoardDto){
    return this.boardService.update(id, dto);
  }


  @Delete(':id')
  remove(@Param('id') id: string){
    return this.boardService.remove(id);
  }

}
