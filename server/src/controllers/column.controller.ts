import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

import { ColumnService } from '../services/column.service';
import { ColumnEntity } from '../entities/column.entity';

@Controller('columns')
export class ColumnController {
    constructor(private readonly columnService: ColumnService) {}

    @Post()
    async create(@Body() column: ColumnEntity): Promise<ColumnEntity> {
        return this.columnService.createColumn(column);
    }

    @Get()
    async findAll(): Promise<ColumnEntity[]> {
        return this.columnService.getAllColumns();
    }

    @Get(':id')
    async findById(@Param('id') id: number): Promise<ColumnEntity> {
        return this.columnService.getColumnById(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() column: ColumnEntity): Promise<ColumnEntity> {
        return this.columnService.updateColumn(id, column);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
        return this.columnService.deleteColumn(id);
    }
}
