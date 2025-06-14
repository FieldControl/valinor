import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './entities/column.entity';

@Injectable()
export class ColumnService {
    constructor(
        @InjectRepository(Column)
        private columnRepository: Repository<Column>,
    ) { }

    async getColumnsByBoardId(boardId: number) {
        const columns = await this.columnRepository.find({ where: { boardId } });
        return columns;
    }
}
