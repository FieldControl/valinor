import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put } from '@nestjs/common'; // Importa os decorators e classes necessárias do NestJS
import { SwimlaneService } from './swimlane.service'; // Importa o serviço SwimlaneService
import { CreateSwimlaneDto } from './dto/create-swimlane.dto'; // Importa o DTO para criar um swimlane
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto'; // Importa o DTO para atualizar um swimlane
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard'; // Importa o AuthGuard e PayloadRequest para autenticação
import { ReorderedSwimlaneDto } from './dto/reorder-swimlane.dto'; // Importa o DTO para reordenar swimlanes

@Controller('swimlane') // Define o controlador para a rota 'swimlane'
export class SwimlaneController { // Define a classe SwimlaneController
  constructor(private readonly swimlaneService: SwimlaneService) {} // Injeta o serviço SwimlaneService no controlador

  @Post() // Define o método HTTP POST para criar um novo swimlane
  @UseGuards(AuthGuard) // Aplica o AuthGuard para proteger a rota

  create( // Define o método create
    @Request() req: PayloadRequest, // Recebe o request com o payload do usuário autenticado
    @Body() createSwimlaneDto: CreateSwimlaneDto, // Recebe o DTO para criar um swimlane
  ) {
    return this.swimlaneService.create(createSwimlaneDto, req.user.id); // Chama o serviço para criar um swimlane, passando o DTO e o ID do usuário
  }

  @Put('update-order') // Define o método HTTP PUT para atualizar a ordem dos swimlanes
  @UseGuards(AuthGuard) // Aplica o AuthGuard para proteger a rota

  updateOrder( // Define o método updateOrder para atualizar a ordem dos swimlanes
    @Request() req: PayloadRequest, // Recebe o request com o payload do usuário autenticado
    @Body() reorderedSwimlanes: ReorderedSwimlaneDto, // Recebe o DTO para reordenar os swimlanes
  ) {
    return this.swimlaneService.updateSwimlaneOrders( // Chama o serviço para atualizar a ordem dos swimlanes
      reorderedSwimlanes, // Passa o DTO com a nova ordem
      req.user.id, // Passa o ID do usuário autenticado
    );
  }

  @Get('/board/:boardId') // Define o método HTTP GET para buscar swimlanes por ID do board
  @UseGuards(AuthGuard) // Aplica o AuthGuard para proteger a rota

  findAll(@Param('boardId') boardId: string, @Request() req: PayloadRequest) { // Define o método findAll para buscar todos os swimlanes
    return this.swimlaneService.findAllByBoardId(Number(boardId), req.user.id); // Chama o serviço para buscar os swimlanes pelo ID do board e ID do usuário
  }

  @Patch(':id') // Define o método HTTP PATCH para atualizar um swimlane por ID
  @UseGuards(AuthGuard) // Aplica o AuthGuard para proteger a rota

  update( // Define o método update para atualizar um swimlane
    @Param('id') id: string, // Recebe o ID do swimlane a ser atualizado
    @Body() updateSwimlaneDto: UpdateSwimlaneDto, // Recebe o DTO para atualizar o swimlane
    @Request() req: PayloadRequest, // Recebe o request com o payload do usuário autenticado
  ) {
    return this.swimlaneService.update(+id, req.user.id, updateSwimlaneDto); // Chama o serviço para atualizar o swimlane, passando o ID, ID do usuário e o DTO, o + é usado para converter a string id em um número
  }

  @Delete(':id') // Define o método HTTP DELETE para remover um swimlane por ID
  @UseGuards(AuthGuard) // Aplica o AuthGuard para proteger a rota

  remove(@Param('id') id: string, @Request() req: PayloadRequest) { // Define o método remove para remover um swimlane
    return this.swimlaneService.remove(+id, req.user.id); // Chama o serviço para remover o swimlane, passando o ID e o ID do usuário, o + é usado para converter a string id em um número
  }
}
