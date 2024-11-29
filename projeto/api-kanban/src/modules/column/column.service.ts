import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { Column } from './dtos/column.model';
import { CreateColumn } from './dtos/column-create.input';

@Injectable()
export class ColumnService {
  constructor(private prismaService: PrismaService) { }

  async columns(): Promise<Column[]> {
    const columns = await this.prismaService.column.findMany()

    return columns
  }

  async crate(body: CreateColumn): Promise<Column> {

    const response = await this.prismaService.column.create({
      data: body,
    })
    
    return response
  }
}
