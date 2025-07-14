import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
@UseGuards(JwtAuthGuard) // Todas as rotas estão protegidas
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @Req() req) {
    const userId = req.user.id; // ✅ Pega a ID do utilizador logado.
    return this.cardsService.create(createCardDto, userId); // ✅ Passa a ID para o serviço.
  }

  @Get()
  findAll(@Req() req, @Query('columnId') columnId?: string) {
    const userId = req.user.id; // ✅ Pega a ID do utilizador logado.
    const columnIdAsNumber = columnId ? parseInt(columnId, 10) : undefined;
    return this.cardsService.findAll(userId, columnIdAsNumber); // ✅ Passa a ID para o serviço.
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto, @Req() req) {
    const userId = req.user.id; // ✅ Pega a ID do utilizador logado.
    return this.cardsService.update(+id, updateCardDto, userId); // ✅ Passa ambas as IDs.
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id; // ✅ Pega a ID do utilizador logado.
    return this.cardsService.remove(+id, userId); // ✅ Passa ambas as IDs.
  }
}