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
} from '@nestjs/common'; // Importa os decoradores e recursos necessários do Nest.js
import { BoardService } from './board.service'; // Importa o serviço de quadro
import { CreateBoardDto } from './dto/create-board.dto'; // Importa o DTO para criar um quadro
import { UpdateBoardDto } from './dto/update-board.dto'; // Importa o DTO para atualizar um quadro
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard'; // Importa o guarda de autenticação e a interface de solicitação do payload

@Controller('board') // Define o controlador para rota '/board'
export class BoardController {
  constructor(private readonly boardService: BoardService) {} // Injeta o serviço de quadro no construtor

  @Post() // Define um manipulador para a rota POST '/board'
  @UseGuards(AuthGuard) // Aplica o guarda de autenticação para esta rota
  create(
    @Body() createBoardDto: CreateBoardDto, // Extrai os dados do corpo da solicitação usando o DTO para criar um quadro
    @Request() req: PayloadRequest, // Extrai o payload da solicitação que contém informações do usuário autenticado
  ) {
    return this.boardService.create(createBoardDto, req.user.id); // Chama o método de serviço para criar um quadro, passando os dados do DTO e o ID do usuário autenticado
  }

  @Get() // Define um manipulador para a rota GET '/board'
  @UseGuards(AuthGuard) // Aplica o guarda de autenticação para esta rota
  findAll(@Request() req: PayloadRequest) { // Extrai o payload da solicitação que contém informações do usuário autenticado
    return this.boardService.findAllByUserId(req.user.id); // Chama o método de serviço para encontrar todos os quadros do usuário autenticado, passando o ID do usuário
  }

  @Get(':id') // Define um manipulador para a rota GET '/board/:id'
  @UseGuards(AuthGuard) // Aplica o guarda de autenticação para esta rota
  async findOne(@Param('id') id: string, @Request() req: PayloadRequest) { // Extrai o ID do quadro da solicitação e o payload contendo informações do usuário autenticado
    const board = await this.boardService.findOne(+id, req.user.id); // Chama o método de serviço para encontrar um quadro pelo ID, passando o ID e o ID do usuário
    board.swimlanes = board.swimlanes.sort((a, b) => a.order - b.order); // Ordena as swimlanes do quadro com base na ordem
    board.swimlanes.forEach((swimlane) => { // Para cada swimlane do quadro
      swimlane.cards = swimlane.cards.sort((a, b) => a.order - b.order); // Ordena os cards da swimlane com base na ordem
    });
    return board; // Retorna o quadro com as swimlanes e os cards ordenados
  }

  @Patch(':id') // Define um manipulador para a rota PATCH '/board/:id'
  @UseGuards(AuthGuard) // Aplica o guarda de autenticação para esta rota
  update(
    @Param('id') id: string, // Extrai o ID do quadro da solicitação
    @Request() req: PayloadRequest, // Extrai o payload da solicitação que contém informações do usuário autenticado
    @Body() updateBoardDto: UpdateBoardDto, // Extrai os dados do corpo da solicitação usando o DTO para atualizar um quadro
  ) {
    return this.boardService.update(+id, req.user.id, updateBoardDto); // Chama o método de serviço para atualizar um quadro, passando o ID, o ID do usuário e os dados de atualização
  }

  @Delete(':id') // Define um manipulador para a rota DELETE '/board/:id'
  @UseGuards(AuthGuard) // Aplica o guarda de autenticação para esta rota
  remove(@Param('id') id: string, @Request() req: PayloadRequest) { // Extrai o ID do quadro da solicitação e o payload contendo informações do usuário autenticado
    return this.boardService.remove(+id, req.user.id); // Chama o método de serviço para remover um quadro, passando o ID e o ID do usuário
  }
}
