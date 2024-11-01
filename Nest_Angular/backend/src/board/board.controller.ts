import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) { }

  // Cria um novo quadro (board).
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createBoardDto: CreateBoardDto,
    @Request() req: PayloadRequest,
  ) {
    return this.boardService.create(createBoardDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Request() req: PayloadRequest) {
    return this.boardService.findAllByUserId(req.user.id);
  }


  //  Busca um quadro específico pelo seu ID e pelo ID do usuário.

  //   @param id - O ID do quadro a ser buscado.
  //   @param req - O objeto de requisição contendo o payload do usuário.
  //   @returns O quadro encontrado, com suas swimlanes e cartões ordenados.

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @Request() req: PayloadRequest) {
    const board = await this.boardService.findOne(+id, req.user.id);
    board.swimlanes = board.swimlanes.sort((a, b) => a.ordem - b.ordem);
    board.swimlanes.forEach((swimlane) => {
      swimlane.cards = swimlane.cards.sort((a, b) => a.ordem - b.ordem);
    });
    return board;
  }


  // Atualiza um quadro existente com base no ID fornecido.

  // @param id - O ID do quadro a ser atualizado.
  // @param req - O objeto de solicitação que contém informações do usuário.
  // @param updateBoardDto - O objeto DTO contendo os dados atualizados do quadro.
  // @returns O quadro atualizado.
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Request() req: PayloadRequest,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(+id, req.user.id, updateBoardDto);
  }

  // Deleta um quadro existente com base no ID fornecido.
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.boardService.remove(+id, req.user.id);
  }
}
