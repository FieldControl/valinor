import { Injectable, NotFoundException } from '@nestjs/common';
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

    async deleteColumn(id: number) {
        const column = await this.columnRepository.findOne({
            where: { id },
            relations: ['tasks']
        });

        if (!column) {
            throw new NotFoundException('Coluna não encontrada.');
        }

        if (column.tasks && column.tasks.length > 0) {
            await this.columnRepository.manager.remove(column.tasks);
        }

        await this.columnRepository.remove(column);
        return { message: 'Coluna deletada com sucesso.' };
    }
}
