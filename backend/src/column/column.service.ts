import { Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Column } from './entities/column.entity';
import { Repository } from 'typeorm';
import { ReordereColumnDto } from './dto/reorder-column.dto';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
  ) {}

  async create(createColumnDto: CreateColumnDto) {
    const column = new Column();
    column.name = createColumnDto.name;
    column.order = createColumnDto.order;
    column.boardId = createColumnDto.boardId;

    return this.columnRepository.save(column);
  }

  async updateColumnOrders(reorder: ReordereColumnDto) {
    const promises = reorder.items.map((column) =>
      this.columnRepository.update(column.id, { order: column.order }),
    );

    await Promise.all(promises);

    return true;
  }

  async hasAccessToColumn() {
    return true;
  }

  findAllByBoardId(boardId: number) {
    return this.columnRepository.find({
      where: {
        boardId,
      },
    });
  }

  async update(id: number, updateColumnDto: UpdateColumnDto) {
    return this.columnRepository.update(id, {
      name: updateColumnDto.name,
    });
  }

  async remove(id: number) {
    return this.columnRepository.delete(id);
  }
}
