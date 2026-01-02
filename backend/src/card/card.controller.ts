import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReorderCardDto } from './dto/reorder-card-dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  @Post('reorder')
  reorderCard(@Body() reorderCardDto: ReorderCardDto[]) {
    return this.cardService.reorderCard(reorderCardDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cardService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardService.update(id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(+id);
  }
}
