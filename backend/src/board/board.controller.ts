import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard';

@Controller('board') // Define a rota base para boards
export class BoardController {
  constructor(private readonly boardService: BoardService) {} // Injeta o BoardService

  @Post()
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  create(
    @Body() createBoardDto: CreateBoardDto, // Recebe dados para criar um board
    @Request() req: PayloadRequest, // Obtém informações do usuário autenticado
  ) {
    return this.boardService.create(createBoardDto, req.user.id); // Cria o board no serviço
  }

  @Get()
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  findAll(@Request() req: PayloadRequest) {
    return this.boardService.findAllByUserId(req.user.id); // Retorna todos os boards do usuário
  }

  @Get(':id')
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  async findOne(@Param('id') id: string, @Request() req: PayloadRequest) {
    const board = await this.boardService.findOne(+id, req.user.id); // Busca um board pelo ID

    // Ordena swimlanes e seus cards
    board.swimlanes.sort((a, b) => a.order - b.order); // Ordena swimlanes
    board.swimlanes.forEach((swimlane) => {
      swimlane.cards.sort((a, b) => a.order - b.order); // Ordena cards dentro das swimlanes
    });
    return board; // Retorna o board encontrado
  }

  @Patch(':id')
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  update(
    @Param('id') id: string, // Recebe o ID do board a ser atualizado
    @Request() req: PayloadRequest, // Obtém informações do usuário autenticado
    @Body() updateBoardDto: UpdateBoardDto, // Recebe dados para atualizar o board
  ) {
    return this.boardService.update(+id, req.user.id, updateBoardDto); // Atualiza o board no serviço
  }

  @Delete(':id')
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.boardService.remove(+id, req.user.id); // Remove o board no serviço
  }
}
