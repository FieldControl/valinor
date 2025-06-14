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

    async createColumn(columnData: Partial<Column>) {
        const existingColumn = await this.columnRepository.findOne({
            where: {
                title: columnData.title,
                boardId: columnData.boardId
            }
        });

        if (existingColumn) {
            throw new Error('Já existe uma coluna com este título para este quadro.');
        }

        const column = this.columnRepository.create(columnData);
        return this.columnRepository.save(column);
    }
}
