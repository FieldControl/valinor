import { Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';

export interface Column {
  id: number;
  title: string;
}

@Injectable()
export class ColumnsService {
  private columns: Column[] = [];

  create(dto: CreateColumnDto): Column {
    const newColumn: Column = {
      id: Date.now(),
      title: dto.title,
    };
    this.columns.push(newColumn);
    return newColumn;
  }

  findAll(): Column[] {
    return this.columns;
  }
}
