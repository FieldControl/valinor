import { Controller, Get } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { Column } from './columns.model';

@Controller('columns')
export class ColumnsController {

    constructor(private readonly columnsService: ColumnsService) {}

    @Get()
    async getColumns(): Promise<Column[]> {
        return this.columnsService.getColumns();
    }
}