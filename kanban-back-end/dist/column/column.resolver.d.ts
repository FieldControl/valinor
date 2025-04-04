import { Column } from './column.model';
import { ColumnService } from './column.service';
export declare class ColumnResolver {
    private columnService;
    constructor(columnService: ColumnService);
    getColumns(): Column[];
    createColumn(title: string): Column;
}
