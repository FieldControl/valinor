import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CardService } from '../services/card.service';
import { CardDto, CreateCardInputDto, UpdateCardInputDto, MoveCardInputDto } from '../dto/card.dto';

@Resolver(() => CardDto)
export class CardResolver {
  constructor(private readonly cardService: CardService) {}

  @Query(() => [CardDto], { name: 'cardsByColumn' })
  async getCardsByColumnId(@Args('columnId', { type: () => ID }) columnId: string): Promise<CardDto[]> {
    return this.cardService.getCardsByColumnId(columnId);
  }

  @Query(() => [CardDto], { name: 'cardsByBoard' })
  async getCardsByBoardId(@Args('boardId', { type: () => ID }) boardId: string): Promise<CardDto[]> {
    return this.cardService.getCardsByBoardId(boardId);
  }

  @Query(() => CardDto, { name: 'card' })
  async getCardById(@Args('id', { type: () => ID }) id: string): Promise<CardDto> {
    return this.cardService.getCardById(id);
  }

  @Mutation(() => CardDto, { name: 'createCard' })
  async createCard(@Args('input') input: CreateCardInputDto): Promise<CardDto> {
    return this.cardService.createCard(input);
  }

  @Mutation(() => CardDto, { name: 'updateCard' })
  async updateCard(@Args('input') input: UpdateCardInputDto): Promise<CardDto> {
    return this.cardService.updateCard(input);
  }

  @Mutation(() => CardDto, { name: 'moveCard' })
  async moveCard(@Args('input') input: MoveCardInputDto): Promise<CardDto> {
    return this.cardService.moveCard(input);
  }

  @Mutation(() => Boolean, { name: 'deleteCard' })
  async deleteCard(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.cardService.deleteCard(id);
  }
}