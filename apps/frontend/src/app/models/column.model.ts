import {
  Column as SharedColumn,
  CreateColumnDto as SharedCreateColumnDto,
  UpdateColumnDto as SharedUpdateColumnDto,
  UpdateColumnPositionsDto as SharedUpdateColumnPositionsDto,
} from '@test/shared-types';

export type Column = SharedColumn;
export type CreateColumnRequest = SharedCreateColumnDto;
export type UpdateColumnRequest = SharedUpdateColumnDto;
export type UpdateColumnPositionsRequest = SharedUpdateColumnPositionsDto;
