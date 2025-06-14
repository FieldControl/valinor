import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './DTO/create-column.dto';

@Controller('columns')
export class ColumnController {
    private readonly _columnService: ColumnService;
    constructor(columnService: ColumnService) {
        this._columnService = columnService;
    }

    @Delete(':id')
    async deleteColumn(@Param('id') id: number) {
        return this._columnService.deleteColumn(id);
    }

    @Post()
    async createColumn(@Body() model: CreateColumnDto) {
        return this._columnService.createColumn(model);
    }

}
