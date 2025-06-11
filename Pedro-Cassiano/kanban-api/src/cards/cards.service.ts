import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { ColumnsService } from 'src/columns/columns.service'; 
import { UpdateCardDto } from './dto/update-card.dto';
import { title } from 'process';

@Injectable()
export class CardsService {
    private nextCardId = 1; // Simple ID generator for cards
    constructor(private readonly columnsService: ColumnsService) {}
  
    create(createCardDto: CreateCardDto) {
    const column = this.columnsService.findOne(createCardDto.columnId);
    const newCard = {
        id: this.nextCardId++,
        title: createCardDto.title,
        content: createCardDto.content,
        columnId: createCardDto.columnId,
    }
    column.cards.push(newCard);
    return newCard;
  }

  findAll() {
    return `This action returns all cards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
