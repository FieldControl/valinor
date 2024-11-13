import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardInput } from './dto/create.input';
import { UpdateCardInput } from './dto/update.input';
import { Card } from './card.entity';

@Injectable()
export class CardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCard(): Promise<Card[]> {
    return this.prisma.card.findMany({
      include: {
        column: true,
      },
    });
  }

  async findCardBycolumnId(columnId: number): Promise<Card[]> {
    return this.prisma.card.findMany({
      where: { columnId: columnId },
    });
  }

  async createCard(data: CreateCardInput): Promise<Card> {
    return this.prisma.card.create({
      data: {
        title: data.title,
        description: data.description,
        position: data.position,
        column: { connect: { id: data.columnId } },
      },
    });
  }

  async updateCard(
    id: number,
    updateCardInput: UpdateCardInput,
  ): Promise<Card> {
    return this.prisma.card.update({
      where: { id },
      data: updateCardInput,
    });
  }

  async deleteCard(id: number): Promise<boolean> {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }

    await this.prisma.card.delete({
      where: { id },
    });

    return true;
  }
}
