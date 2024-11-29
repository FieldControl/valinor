import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { Column } from './dtos/column.model';
import { CreateColumn } from './dtos/column-create.input';
import { UpdateColumn } from './dtos/column-update.input';

@Injectable()
export class ColumnService {
  constructor(private prismaService: PrismaService) { }

  async columns(): Promise<Column[]> {
    return await this.prismaService.column.findMany()
  }

  async crate(body: CreateColumn): Promise<Column> {
    return await this.prismaService.column.create({
      data: body,
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
