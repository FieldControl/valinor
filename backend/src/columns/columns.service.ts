import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(createColumnDto: CreateColumnDto) {
    return await this.prisma.column.create({
      data: {
        name: createColumnDto.name,
        order: createColumnDto.order,
      }
    });
  }

  async update(id: string, updateColumnDto: CreateColumnDto) {
    return await this.prisma.column.update({
      where: { id },
      data: {
        name: updateColumnDto.name,
        order: updateColumnDto.order,
      }
    });
  }

  async index() {
    return await this.prisma.column.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async delete(id: string) {
    return await this.prisma.column.delete({ where: { id } });
  }
}
