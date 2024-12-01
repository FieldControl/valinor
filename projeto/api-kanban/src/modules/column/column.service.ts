import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { Column } from './dtos/column.model';
import { CreateColumn } from './dtos/column-create.input';
import { UpdateColumn } from './dtos/column-update.input';

@Injectable()
export class ColumnService {
  constructor(private prismaService: PrismaService) { }

  async lastColumn(): Promise<Column | null> {
    return await this.prismaService.column.findFirst({
      orderBy: {
        sequence: 'desc',
      },
    })
  }

  async columns(): Promise<Column[]> {
    return await this.prismaService.column.findMany({
      include: {
        tasks: true,
      },
      orderBy: {
        sequence: 'asc',
      }
    })
  }

  async crate(body: CreateColumn): Promise<Column> {
    const column = await this.lastColumn()

    return await this.prismaService.column.create({
      data: {
        ...body,
        sequence: column?.id ? column.sequence + 1 : 1
      },
    })
  }

  async update(body: UpdateColumn): Promise<Column> {
    const { id, ...updatedFields } = body

    return await this.prismaService.column.update({
      where: { id },
      data: updatedFields,
    })
  }

  async delete(id: number): Promise<{ id: number }> {
    await this.prismaService.column.update({
      where: { id },
      data: {
        deleted: true,
      },
    })

    return { id }
  }
}
