import { Injectable } from '@nestjs/common';
import { Prisma, Column } from '@prisma/client';
import { InvalidDeleteProjectError } from 'src/core/errors/invalid-delete-project-error';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async createColumn(
    data: Prisma.ColumnUncheckedCreateInput,
  ): Promise<Omit<Column, 'projectId'>> {
    const column = await this.prisma.column.create({
      data,
      select: {
        id: true,
        title: true,
        project: true,
      },
    });

    return column;
  }

  async getAllColumns(): Promise<Column[]> {
    const columns = await this.prisma.column.findMany();

    return columns;
  }

  async getColumnsById(id: string): Promise<Column> {
    const column = await this.prisma.column.findUnique({
      where: {
        id,
      },
    });

    return column;
  }

  async deleteColumnById(id: string) {
    try {
      const column = await this.prisma.column.delete({
        where: {
          id,
        },
      });

      return column;
    } catch (_) {
      throw new InvalidDeleteProjectError();
    }
  }

  async updateColumnById(id: string, title: string): Promise<Column> {
    const column = await this.prisma.column.update({
      where: {
        id,
      },
      data: {
        title,
      },
    });

    return column;
  }
}
