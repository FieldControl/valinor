import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReorderColumnDto } from './dto/reorder-column.dto';
import { EventsGateway } from 'src/gateways/events/events.gateway';
// import { AblyGateway } from 'src/gateways/ably/ably.gateway';

@Injectable()
export class ColumnService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    // private eventsGateway: AblyGateway,
  ) {}

  async create(createColumnDto: CreateColumnDto) {
    const lastColumn = await this.prisma.column.findFirst({
      orderBy: {
        position: 'desc',
      },
    });
    const position = lastColumn ? lastColumn.position + 1 : 0;
    const column = await this.prisma.column.create({
      data: {
        ...createColumnDto,
        position,
      },
    });

    this.eventsGateway.emit('column.created', column);

    return column;
  }

  findAllWithCards() {
    return this.prisma.column.findMany({
      orderBy: {
        position: 'asc',
      },
      include: {
        cards: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const column = await this.prisma.column.findUnique({
      where: {
        id,
      },
    });

    if (!column) {
      throw new NotFoundException('A coluna não existe.');
    }
    return column;
  }

  async reorderColumn(reorderColumnDto: ReorderColumnDto[]) {
    const ids = reorderColumnDto.map((dto) => dto.id);
    const positions = reorderColumnDto.map((dto) => dto.position);

    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Ids duplicados não são permitidos.');
    }

    if (new Set(positions).size !== positions.length) {
      throw new BadRequestException('Posições duplicadas não são permitidos.');
    }

    await Promise.all(ids.map((id) => this.findOne(id)));

    const reordenedColumns = await this.prisma.$transaction(
      reorderColumnDto.map((dto) =>
        this.prisma.column.update({
          where: { id: dto.id },
          data: { position: dto.position },
        }),
      ),
    );

    this.eventsGateway.emit('column.reordered', reordenedColumns);

    return reordenedColumns;
  }

  async update(id: number, updateColumnDto: UpdateColumnDto) {
    await this.findOne(id);
    const column = await this.prisma.column.update({
      where: {
        id,
      },
      data: updateColumnDto,
    });
    this.eventsGateway.emit('column.updated', column);
    return column;
  }

  async remove(id: number) {
    await this.findOne(id);
    const column = await this.prisma.column.delete({
      where: {
        id,
      },
    });

    this.eventsGateway.emit('column.deleted', column);

    return column;
  }
}
