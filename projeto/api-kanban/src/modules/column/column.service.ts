import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { Column } from './dtos/column.model';
import { CreateColumn } from './dtos/column-create.input';
import { UpdateColumn } from './dtos/column-update.input';

@Injectable()
export class ColumnService {
  constructor(private prismaService: PrismaService) { }

  async column(id: number): Promise<Column> {
    return await this.prismaService.column.findFirst({
      where: {
        id
      }
    })
  }


  async lastColumn(): Promise<Column | null> {
    return await this.prismaService.column.findFirst({
      where: {
        deleted: false,
      },
      orderBy: {
        sequence: 'desc',
      },
    })
  }

  async columns(): Promise<Column[]> {
    const response = await this.prismaService.column.findMany({
      where: {
        deleted: false,
      },
      include: {
        tasks: {
          where: {
            deleted: false,
          }
        }
      },
      orderBy: {
        sequence: 'asc',
      }
    })

    return response
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
    const column = await this.column(id)

    await this.prismaService.column.update({
      where: { id },
      data: {
        deleted: true,
      },
    })

    await this.prismaService.column.updateMany({
      where: {
        id,
        sequence: {
          gte: column.sequence,
        },
        deleted: false,
      },
      data: {
        sequence: {
          decrement: 1,
        },
      },
    });

    await this.prismaService.task.updateMany({
      where: {
        id_column: id,
      },
      data: {
        deleted: true,
      },
    });

    return { id }
  }
}
