import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @Get()
  findAll(@Query('columnId') columnId?: string) {
    if (columnId) {
      return this.cardsService.findByColumn(parseInt(columnId));
    }
    return this.cardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto
  ) {
    return this.cardsService.update(id, updateCardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cardsService.remove(id);
  }

  @Patch(':id/move')
  moveCard(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveData: { columnId: number; position: number }
  ) {
    return this.cardsService.moveCard(id, moveData.columnId, moveData.position);
  }

  @Patch('positions/update')
  updatePositions(
    @Body() cards: { id: number; position: number; columnId?: number }[]
  ) {
    return this.cardsService.updatePositions(cards);
  }
}
