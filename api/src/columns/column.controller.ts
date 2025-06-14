import { Controller, Get } from '@nestjs/common';
import { ColumnService } from './column.service';

@Controller('column')
export class ColumnController {
    private readonly _columnService: ColumnService;
    constructor(columnService: ColumnService) {
        this._columnService = columnService;
    }

}
