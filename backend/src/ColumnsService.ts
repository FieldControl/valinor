import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(createColumnDto: CreateColumnDto) {
    const { boardId } = createColumnDto;

    const maxOrder = await this.prisma.column.aggregate({
      _max: {
        order: true,
      },
      where: { boardId },
    });

    return this.prisma.column.create({
      data: {
        ...createColumnDto,
        order: maxOrder._max.order !== null ? maxOrder._max.order + 1 : 0,
      },
    });
  }

  findAll() {
    return this.prisma.column.findMany({ include: { tasks: true } });
  }

  findOne(id: string) {
    return this.prisma.column.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }

  update(id: string, updateColumnDto: UpdateColumnDto) {
    return this.prisma.column.update({
      where: { id },
      data: updateColumnDto,
    });
  }

  remove(id: string) {
    return this.prisma.column.delete({ where: { id } });
  }
}