import { Priority } from '../common/priority.type';
import { PositionUpdate } from '../common/position-update.interface';

export interface CreateCardDto {
  title: string;
  description?: string;
  position?: number;
  color?: string;
  priority?: Priority;
  columnId: number;
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
  position?: number;
  color?: string;
  priority?: Priority;
  columnId?: number;
}

export interface MoveCardDto {
  columnId: number;
  position: number;
}

export interface UpdateCardPositionsDto extends PositionUpdate {
  columnId?: number;
}
