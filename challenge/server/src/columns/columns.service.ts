import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dtos/create-column.dto';
import { EditColumnDto } from './dtos/edit-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  // IMPROVEMENT: encode id whenever it is returned, so people can`t mess around
  async createColumn(createColumnDto: CreateColumnDto) {
    const column = await this.prisma.column.create({
      data: {
        ...createColumnDto,
      },
    });

    return column;
  }

  async listColumns() {
    const columns = await this.prisma.column.findMany({
      include: {
        Cards: true,
      },
    });

    return columns;
  }

  async deleteColumn(columnId: number) {
    // IMPROVEMENT: verify if column exists
    await this.prisma.column.delete({
      where: {
        id: columnId,
      },
    });
  }

  async editColumn(columnId: number, editColumnDto: EditColumnDto) {
    // IMPROVEMENT: verify if column exists
    const column = await this.prisma.column.update({
      where: {
        id: columnId,
      },
      data: {
        ...editColumnDto,
      },
    });

    return column;
  }
}
