import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ColumnService } from 'src/column/column.service';
import { ReorderCardDto } from './dto/reorder-card-dto';
import { EventsGateway } from 'src/gateways/events/events.gateway';
import { AblyGateway } from 'src/gateways/ably/ably.gateway';

@Injectable()
export class CardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly columnService: ColumnService,
    private readonly eventsGateway: EventsGateway,
    // private readonly eventsGateway: AblyGateway,
  ) {}

  async create(createCardDto: CreateCardDto) {
    await this.columnService.findOne(createCardDto.columnId);
    const lastCard = await this.prisma.card.findFirst({
      orderBy: {
        position: 'desc',
      },
    });
    const position = lastCard ? lastCard.position + 1 : 0;
    const newCard = await this.prisma.card.create({
      data: {
        ...createCardDto,
        position,
      },
    });

    this.eventsGateway.emit('card.created', newCard);

    return newCard;
  }

  findAll() {
    return this.prisma.card.findMany();
  }

  async reorderCard(reorderCardDto: ReorderCardDto[]) {
    const cardIds = reorderCardDto.map((dto) => dto.id);

    if (new Set(cardIds).size !== cardIds.length) {
      throw new BadRequestException('Ids duplicados não são permitidos.');
    }

    const cards = await Promise.all(cardIds.map((id) => this.findOne(id)));

    const cardsMap = new Map(cards.map((card) => [card.id, card]));

    const positionsByColumn = new Map<number, Set<number>>();

    for (const dto of reorderCardDto) {
      const card = cardsMap.get(dto.id)!;
      const columnId =
        dto.columnId !== undefined ? dto.columnId : card.columnId;

      if (!positionsByColumn.has(columnId)) {
        positionsByColumn.set(columnId, new Set());
      }

      const positions = positionsByColumn.get(columnId)!;

      if (positions.has(dto.position)) {
        throw new BadRequestException(
          `Posição ${dto.position} duplicada na coluna ${columnId}.`,
        );
      }

      positions.add(dto.position);
    }

    const columnIds = reorderCardDto
      .map((dto) => dto.columnId)
      .filter((id): id is number => id !== undefined);

    if (columnIds.length > 0) {
      const uniqueColumnIds = [...new Set(columnIds)];
      await Promise.all(
        uniqueColumnIds.map((id) => this.columnService.findOne(id)),
      );
    }

    const reordenedCards = await this.prisma.$transaction(
      reorderCardDto.map((dto) =>
        this.prisma.card.update({
          where: { id: dto.id },
          data: {
            position: dto.position,
            ...(dto.columnId !== undefined && { columnId: dto.columnId }),
          },
        }),
      ),
    );

    this.eventsGateway.emit('card.reordered', reordenedCards);
    return reordenedCards;
  }

  async findOne(id: number) {
    const card = await this.prisma.card.findUnique({
      where: {
        id,
      },
    });

    if (!card) {
      throw new NotFoundException('O card não foi encontrado.');
    }
    return card;
  }

  async update(id: number, updateCardDto: UpdateCardDto) {
    await this.findOne(id);
    const cardUpdated = await this.prisma.card.update({
      where: {
        id,
      },
      data: {
        ...updateCardDto,
      },
    });

    this.eventsGateway.emit('card.updated', cardUpdated);

    return cardUpdated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const cardDeleted = await this.prisma.card.delete({
      where: {
        id,
      },
    });

    const cards = await this.prisma.card.findMany({
      where: {
        columnId: cardDeleted.columnId,
      },
      orderBy: {
        position: 'asc',
      },
    });

    const reordered = cards.map((c, index) => ({
      id: c.id,
      columnId: c.columnId,
      position: index + 1,
    }));

    await this.prisma.$transaction(
      reordered.map((c) =>
        this.prisma.card.update({
          where: { id: c.id },
          data: { position: c.position },
        }),
      ),
    );

    this.eventsGateway.emit('card.deleted', { id });
    this.eventsGateway.emit('card.reordered', reordered);
  }
}
