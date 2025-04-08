import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common'; // Importa os decorators e classes necessárias do NestJS
import { BoardService } from './board.service'; // Importa o serviço de board
import { CreateBoardDto } from './dto/create-board.dto'; // Importa o DTO de criação de board
import { UpdateBoardDto } from './dto/update-board.dto'; // Importa o DTO de atualização de board
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard'; // Importa o AuthGuard e o tipo de requisição com payload

@Controller('board') // Define o prefixo da rota como 'board'
export class BoardController {
  constructor(private readonly boardService: BoardService) {} // Injeta o serviço de board no controlador

  @Post() // Define o método HTTP como POST para criar um novo board
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota

  // Define o método create que recebe um DTO de criação de board e a requisição
  create(
    @Body() createBoardDto: CreateBoardDto, // Recebe o DTO de criação de board no corpo da requisição
    @Request() req: PayloadRequest, // Recebe a requisição com o payload do usuário autenticado
  ) {
    return this.boardService.create(createBoardDto, req.user.id); // Chama o serviço de board para criar um novo board
  }

  @Get() // Define o método HTTP como GET para buscar todos os boards
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota

  // Define o método findAll para buscar todos os boards do usuário
  findAll(@Request() req: PayloadRequest) {
    return this.boardService.findAllByUserId(req.user.id);
  }

  @Get(':id') // Define o método HTTP como GET para buscar um board específico através do ID
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota

  // Define o método findOne que recebe o ID do board e a requisição
  async findOne(@Param('id') id: string, @Request() req: PayloadRequest) { // Recebe o ID do board como parâmetro e a requisição com o payload do usuário autenticado
    const board = await this.boardService.findOne(+id, req.user.id); // Chama o serviço de board para buscar o board pelo ID e ID do usuário, o operador + é usado para converter a string id em um número, já que o ID do board é um número no banco de dados.

 // Ordena as swimlanes do board pela propriedade 'order', que é um número que representa a ordem de exibição das swimlanes. Isso garante que as swimlanes sejam exibidas na ordem correta na interface do usuário.
    board!.swimlanes = board!.swimlanes.sort((a, b) => a.order - b.order); // O operador de asserção não nula (!) é usado para indicar que o valor de board não é nulo ou indefinido. Isso é útil quando você tem certeza de que o valor existe, mas o TypeScript não consegue inferir isso automaticamente.

    board!.swimlanes.forEach((swimlane) => { // Percorre cada swimlane do board
      // Ordena os cards de cada swimlane pela propriedade 'order', que é um número que representa a ordem de exibição dos cards. Isso garante que os cards sejam exibidos na ordem correta na interface do usuário.
      swimlane.cards = swimlane.cards.sort((a, b) => a.order - b.order);
    });
    return board; // Retorna o board encontrado
  }

  @Patch(':id') // Define o método HTTP como PATCH para atualizar um board específico através do ID
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota

  // Define o método update que recebe o ID do board, a requisição e o DTO de atualização de board
  update(
    @Param('id') id: string, // Recebe o ID do board como parâmetro
    @Request() req: PayloadRequest, // Recebe a requisição com o payload do usuário autenticado
    @Body() updateBoardDto: UpdateBoardDto, // Recebe o DTO de atualização de board no corpo da requisição
  ) {
    return this.boardService.update(+id, req.user.id, updateBoardDto); // Chama o serviço de board para atualizar o board pelo ID e ID do usuário, passando o DTO de atualização
  }

  @Delete(':id') // Define o método HTTP como DELETE para remover um board específico através do ID
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota
  remove(@Param('id') id: string, @Request() req: PayloadRequest) { // Recebe o ID do board como parâmetro e a requisição com o payload do usuário autenticado
    return this.boardService.remove(+id, req.user.id); // Chama o serviço de board para remover o board pelo ID e ID do usuário
  }
}
