import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createColumnDto: CreateColumnDto) {
    return this.prisma.column.create({
      data: {
        title: createColumnDto.title,
      },
    });
  }

  async findAll() {
  return this.prisma.column.findMany({
    include: { cards: true },
  });
}

update(id: number, data: UpdateColumnDto) {
  return this.prisma.column.update({
    where: { id },
    data,
  });
}

remove(id: number) {
  return this.prisma.column.delete({ where: { id } });
}
}