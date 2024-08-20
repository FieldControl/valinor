import { Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ColumnsService {
  constructor(private prismaService: PrismaService) {}

  async create(createColumnDto: CreateColumnDto) {
    const newColumn = await this.prismaService.column.create({
      data: {
        ...createColumnDto,
      },
    });

    return newColumn;
  }

  async findAll() {
    return this.prismaService.column.findMany();
  }

  async findOne(columnId: string) {
    const column = await this.prismaService.column.findMany({
      where: {
        id: columnId,
      },
    });

    if (!column) throw new NotFoundError('column not found');

    return column;
  }

  async update(columnId: string, updateColumnDto: UpdateColumnDto) {
    const updatedColumn = await this.prismaService.column.update({
      where: {
        id: columnId,
      },
      data: {
        ...updateColumnDto,
      },
    });

    return updatedColumn;
  }

  async remove(id: string) {
    return `This action removes a #${id} column`;
  }
}
