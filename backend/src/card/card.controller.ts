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
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard';
import { ReorderedCardDto } from './dto/reorder-cards.dto';

@Controller('card') // Define a rota base para cards
export class CardController {
  constructor(private readonly cardService: CardService) {} // Injeta o CardService

  @Post() // Método para criar um card
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  create(@Body() createCardDto: CreateCardDto, @Request() req: PayloadRequest) {
    return this.cardService.create(createCardDto, req.user.id); // Chama o serviço para criar o card
  }

  @Put('update-order') // Método para atualizar a ordem dos cards
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  updateOrder(
    @Body() reorderCards: ReorderedCardDto, // Recebe dados para reordenar cards
    @Request() req: PayloadRequest,
  ) {
    return this.cardService.updateCardOrdersAndSwimlanes(
      reorderCards,
      req.user.id, // Chama o serviço para atualizar a ordem dos cards e swimlanes
    );
  }

  @Patch(':id') // Método para atualizar um card específico
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  update(
    @Param('id') id: string, // Recebe o ID do card a ser atualizado
    @Request() req: PayloadRequest,
    @Body() updateCardDto: UpdateCardDto, // Recebe dados para atualizar o card
  ) {
    return this.cardService.update(+id, req.user.id, updateCardDto); // Chama o serviço para atualizar o card
  }

  @Delete(':id') // Método para remover um card específico
  @UseGuards(AuthGuard) // Protege a rota com autenticação
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.cardService.remove(+id, req.user.id); // Chama o serviço para remover o card
  }
}
