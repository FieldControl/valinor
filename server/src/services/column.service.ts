import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from '../entities/column.entity';

@Injectable()
export class ColumnService {
    
    constructor(
        @InjectRepository(ColumnEntity)
        private readonly columnRepository: Repository<ColumnEntity>,
    ) {}

    async getAllColumns(): Promise<ColumnEntity[]> {
        return this.columnRepository.find();
    }

    async getColumnById(id: number): Promise<ColumnEntity> {
        return this.columnRepository.findOne({ where: { id } });
    }

    async createColumn(column: ColumnEntity): Promise<ColumnEntity> {
        return this.columnRepository.save(column);
    }

    async updateColumn(id: number, column: ColumnEntity): Promise<ColumnEntity> {
        await this.columnRepository.update(id, column);
        return this.columnRepository.findOne({ where: { id } });
    }

    async deleteColumn(id: number): Promise<void> {
        await this.columnRepository.delete(id);
    }
}