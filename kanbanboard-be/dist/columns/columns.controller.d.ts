import { ColumnsService } from './columns.service';
import { Column } from './columns.model';
export declare class ColumnsController {
    private readonly columnsService;
    constructor(columnsService: ColumnsService);
    getColumns(): Promise<Column[]>;
}
