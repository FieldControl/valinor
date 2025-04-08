import { Controller, Post, Body, Request, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common'; // Importando os decorators e classes necessárias do NestJS
import { CardService } from './card.service'; // Importando o serviço CardService
import { CreateCardDto } from './dto/create-card.dto'; // Importando o DTO para criar um cartão
import { UpdateCardDto } from './dto/update-card.dto'; // Importando o DTO para atualizar um cartão
import { AuthGuard, PayloadRequest } from 'src/auth/auth/auth.guard'; // Importando o AuthGuard e PayloadRequest para autenticação
import { ReorderedCardDto } from './dto/reorder-cards.dto'; // Importando o DTO para reordenar cartões

@Controller('card') // Definindo o controlador para a rota 'card'
export class CardController { // Definindo a classe CardController
  constructor(private readonly cardService: CardService) {} // Injetando o CardService no construtor

  @Post() // Definindo o método HTTP POST para criar um cartão
  @UseGuards(AuthGuard) // Usando o AuthGuard para proteger a rota

  create(@Body() createCardDto: CreateCardDto, @Request() req: PayloadRequest) { // Método para criar um cartão
    return this.cardService.create(createCardDto, req.user.id); // Chamando o método create do CardService
  }

  @Put('update-order') // Definindo o método HTTP PUT para atualizar a ordem dos cartões
  @UseGuards(AuthGuard) // Usando o AuthGuard para proteger a rota

  updateOrder( // Método para atualizar a ordem dos cartões
    @Body() reorderCards: ReorderedCardDto, // Recebendo o DTO de reordenação de cartões
    @Request() req: PayloadRequest, // Recebendo o request com os dados do usuário autenticado
  ) {
    return this.cardService.updateCardOrdersAndSwimlanes( // Chamando o método do CardService para atualizar a ordem
      reorderCards, // Passando o DTO de reordenação
      req.user.id, // Passando o ID do usuário autenticado
    );
  }

  @Patch(':id') // Definindo o método HTTP PATCH para atualizar um cartão
  @UseGuards(AuthGuard) // Usando o AuthGuard para proteger a rota

  update( // Método para atualizar um cartão
    @Param('id') id: string, // Recebendo o ID do cartão a ser atualizado
    @Request() req: PayloadRequest, // Recebendo o request com os dados do usuário autenticado
    @Body() updateCardDto: UpdateCardDto, // Recebendo o DTO de atualização de cartão
  ) {
    return this.cardService.update(+id, req.user.id, updateCardDto); // Chamando o método update do CardService
  }

  @Delete(':id') // Definindo o método HTTP DELETE para remover um cartão
  @UseGuards(AuthGuard) // Usando o AuthGuard para proteger a rota

  remove(@Param('id') id: string, @Request() req: PayloadRequest) { // Método para remover um cartão
    return this.cardService.remove(+id, req.user.id); // Chamando o método remove do CardService
  }
}
