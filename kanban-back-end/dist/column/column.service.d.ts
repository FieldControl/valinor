import { Column } from './column.model';
import { Card } from '../card/card.model';
export declare class ColumnService {
    private columns;
    getAll(): Column[];
    create(title: string): Column;
    getById(id: string): Column | undefined;
    addCardToColumn(columnId: string, card: Card): void;
}
