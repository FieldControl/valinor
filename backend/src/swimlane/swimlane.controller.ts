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
  Put,
} from '@nestjs/common';
import { SwimlaneService } from './swimlane.service'; // Importa o serviço SwimlaneService
import { CreateSwimlaneDto } from './dto/create-swimlane.dto'; // Importa o DTO para criar uma swimlane
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto'; // Importa o DTO para atualizar uma swimlane
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard'; // Importa o AuthGuard para autenticação do usuário
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto'; // Importa o DTO para reordenar as swimlanes

@Controller('swimlane')
export class SwimlaneController {
  constructor(private readonly swimlaneService: SwimlaneService) {}

  // Rota para criar uma nova swimlane
  @Post()
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota
  create(
    @Request() req: PayloadRequest, // Requisição contendo os dados do usuário autenticado
    @Body() createSwimlaneDto: CreateSwimlaneDto, // Dados da nova swimlane fornecidos no corpo da requisição
  ) {
    return this.swimlaneService.create(createSwimlaneDto, req.user.id); // Chama o método create do serviço SwimlaneService
  }

  // Rota para atualizar a ordem das swimlanes
  @Put('update-order')
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota
  updateOrder(
    @Request() req: PayloadRequest, // Requisição contendo os dados do usuário autenticado
    @Body() reorderedSwimlanes: ReordereSwimlaneDto, // Dados para reordenar as swimlanes fornecidos no corpo da requisição
  ) {
    return this.swimlaneService.updateSwimlaneOrders(
      reorderedSwimlanes,
      req.user.id,
    ); // Chama o método updateSwimlaneOrders do serviço SwimlaneService
  }

  // Rota para buscar todas as swimlanes de uma placa específica
  @Get('/board/:boardId')
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota
  findAll(
    @Param('boardId') boardId: string, // Parâmetro contendo o ID da placa
    @Request() req: PayloadRequest, // Requisição contendo os dados do usuário autenticado
  ) {
    return this.swimlaneService.findAllByBoardId(
      Number(boardId),
      req.user.id,
    ); // Chama o método findAllByBoardId do serviço SwimlaneService
  }

  // Rota para atualizar uma swimlane existente
  @Patch(':id')
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota
  update(
    @Param('id') id: string, // Parâmetro contendo o ID da swimlane a ser atualizada
    @Body() updateSwimlaneDto: UpdateSwimlaneDto, // Dados atualizados da swimlane fornecidos no corpo da requisição
    @Request() req: PayloadRequest, // Requisição contendo os dados do usuário autenticado
  ) {
    return this.swimlaneService.update(
      +id,
      req.user.id,
      updateSwimlaneDto,
    ); // Chama o método update do serviço SwimlaneService
  }

  // Rota para remover uma swimlane existente
  @Delete(':id')
  @UseGuards(AuthGuard) // Usa o AuthGuard para proteger a rota
  remove(
    @Param('id') id: string, // Parâmetro contendo o ID da swimlane a ser removida
    @Request() req: PayloadRequest, // Requisição contendo os dados do usuário autenticado
  ) {
    return this.swimlaneService.remove(+id, req.user.id); // Chama o método remove do serviço SwimlaneService
  }
}
