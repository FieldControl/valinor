import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(@Body() createBoardDto: CreateBoardDto) {
    return await this.boardsService.create(createBoardDto);
  }

  @Get()
  async findAll() {
    return await this.boardsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.boardsService.findOne(+id);
  }
  @Get('user/:id')
  async findAllByUserId(@Param('id') id: string) {
    return await this.boardsService.findAllWhereUserId(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return await this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.boardsService.remove(+id);
  }
}
