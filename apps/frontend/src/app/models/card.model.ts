import {
  Card as SharedCard,
  CreateCardDto as SharedCreateCardDto,
  UpdateCardDto as SharedUpdateCardDto,
  MoveCardDto as SharedMoveCardDto,
  UpdateCardPositionsDto as SharedUpdateCardPositionsDto,
} from '@test/shared-types';

export type Card = SharedCard;
export type CreateCardRequest = SharedCreateCardDto;
export type UpdateCardRequest = SharedUpdateCardDto;
export type MoveCardRequest = SharedMoveCardDto;
export type UpdateCardPositionsRequest = SharedUpdateCardPositionsDto;
