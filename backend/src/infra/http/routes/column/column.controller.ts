import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { Column } from '@prisma/client';
import { JwtAuthGuard } from 'src/infra/auth/jwt-auth.guard';

interface ColumnRequest {
  title: string;
  projectId: string;
}

interface ColumnResponse {
  column: Omit<Column, 'projectId'>;
}

@Controller('column')
@UseGuards(JwtAuthGuard)
export class ColumnController {
  constructor(private columnService: ColumnService) {}

  @Post()
  async create(
    @Body()
    { title, projectId }: ColumnRequest,
  ): Promise<ColumnResponse> {
    const column = await this.columnService.createColumn({ title, projectId });

    return { column };
  }

  @Get()
  async getAll(): Promise<Column[]> {
    const column = await this.columnService.getAllColumns();

    return column;
  }

  @Get(':id')
  async getColumnById(@Param('id') id: string): Promise<Column> {
    const project = await this.columnService.getColumnsById(id);

    return project;
  }

  @Delete(':id')
  async deleteColumnById(@Param('id') id: string) {
    await this.columnService.deleteColumnById(id);
    return { message: 'Coluna deletada com sucesso' };
  }

  @Patch(':id')
  async updateColumnById(
    @Param('id') id: string,
    @Body() { title }: ColumnRequest,
  ): Promise<Column> {
    const column = await this.columnService.updateColumnById(id, title);

    return column;
  }
}
