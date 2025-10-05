import { PositionUpdate } from '../common/position-update.interface';

export interface CreateColumnDto {
  title: string;
  description?: string;
  position?: number;
  color?: string;
}

export interface UpdateColumnDto {
  title?: string;
  description?: string;
  position?: number;
  color?: string;
}

export interface UpdateColumnPositionsDto extends PositionUpdate {}
