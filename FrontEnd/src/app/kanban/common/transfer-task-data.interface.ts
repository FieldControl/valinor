import { KanbanList } from '../model';

export interface TransferTaskData {
  fromList: KanbanList;
  fromIndex: number;
  toList: KanbanList;
  toIndex: number;
}
