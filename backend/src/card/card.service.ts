import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { ColumnService } from 'src/column/column.service';
import { ReorderedCardDto } from './dto/reorder-cards.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private columnService: ColumnService,
  ) {}

  async create(createCardDto: CreateCardDto) {
    const card = new Card();
    card.name = createCardDto.name;
    card.content = createCardDto.content;
    card.columnId = createCardDto.columnId;
    card.order = createCardDto.order;

    return this.cardRepository.save(card);
  }

  async updateCardOrdersAndColumns(reorder: ReorderedCardDto) {
    const promises = reorder.cards.map((card) =>
      this.cardRepository.update(card.id, {
        order: card.order,
        columnId: card.columnId,
      }),
    );

    await Promise.all(promises);

    return true;
  }

  async update(id: number, updateCardDto: UpdateCardDto) {
    return this.cardRepository.update(id, {
      name: updateCardDto.name,
      content: updateCardDto.content,
    });
  }

  async remove(id: number) {
    return this.cardRepository.delete(id);
  }
}
