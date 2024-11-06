import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dtos/create-card.dto';
import { EditCardDto } from './dtos/edit-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  // IMPROVEMENT: encode id whenever it is returned, so people can`t mess around
  async createCard(createCardDto: CreateCardDto) {
    const card = await this.prisma.card.create({
      data: {
        ...createCardDto,
      },
    });

    return card;
  }

  async listCards(columnId: number) {
    const cards = await this.prisma.card.findMany({
      where: {
        columnId,
      },
    });

    return cards;
  }

  async deleteCard(cardId: number) {
    // IMPROVEMENT: verify if card exists
    await this.prisma.card.delete({
      where: {
        id: cardId,
      },
    });
  }

  async editCard(cardId: number, editCardDto: EditCardDto) {
    // IMPROVEMENT: verify if card exists
    const card = await this.prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        ...editCardDto,
      },
    });

    return card;
  }
}
