import {
  Controller,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CardService } from './card.service'; // Importa o serviço CardService para lidar com as operações de cartões
import { CreateCardDto } from './dto/create-card.dto'; // Importa o DTO para criar um card
import { UpdateCardDto } from './dto/update-card.dto'; // Importa o DTO para atualizar um card
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard'; // Importa o AuthGuard para autenticar as solicitações
import { ReorderedCardDto } from './dto/reorder-cards.dto'; // Importa o DTO para reordenar os cards

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  // Rota para criar um novo card
  @Post()
  @UseGuards(AuthGuard) // Usa o AuthGuard para autenticar a solicitação
  create(@Body() createCardDto: CreateCardDto, @Request() req: PayloadRequest) {
    return this.cardService.create(createCardDto, req.user.id); // Chama o método create do CardService
  }

  // Rota para atualizar a ordem dos cards e das swimlanes
  @Put('update-order')
  @UseGuards(AuthGuard) // Usa o AuthGuard para autenticar a solicitação
  updateOrder(
    @Body() reorderCards: ReorderedCardDto,
    @Request() req: PayloadRequest,
  ) {
    return this.cardService.updateCardOrdersAndSwimlanes(
      reorderCards,
      req.user.id,
    ); // Chama o método updateCardOrdersAndSwimlanes do CardService
  }

  // Rota para atualizar um card existente
  @Patch(':id')
  @UseGuards(AuthGuard) // Usa o AuthGuard para autenticar a solicitação
  update(
    @Param('id') id: string,
    @Request() req: PayloadRequest,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardService.update(+id, req.user.id, updateCardDto); // Chama o método update do CardService
  }

  // Rota para remover um card existente
  @Delete(':id')
  @UseGuards(AuthGuard) // Usa o AuthGuard para autenticar a solicitação
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.cardService.remove(+id, req.user.id); // Chama o método remove do CardService
  }
}
