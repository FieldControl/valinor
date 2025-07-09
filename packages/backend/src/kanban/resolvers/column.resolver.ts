import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { ColumnService } from '../services/column.service';
import { CardService } from '../services/card.service';
import { ColumnDto, CreateColumnInputDto, UpdateColumnInputDto, MoveColumnInputDto } from '../dto/column.dto';
import { CardDto } from '../dto/card.dto';

@Resolver(() => ColumnDto)
export class ColumnResolver {
  constructor(
    private readonly columnService: ColumnService,
    private readonly cardService: CardService,
  ) {}

  @Query(() => [ColumnDto], { name: 'columnsByBoard' })
  async getColumnsByBoardId(@Args('boardId', { type: () => ID }) boardId: string): Promise<ColumnDto[]> {
    return this.columnService.getColumnsByBoardId(boardId);
  }

  @Query(() => ColumnDto, { name: 'column' })
  async getColumnById(@Args('id', { type: () => ID }) id: string): Promise<ColumnDto> {
    return this.columnService.getColumnById(id);
  }

  @Mutation(() => ColumnDto, { name: 'createColumn' })
  async createColumn(@Args('input') input: CreateColumnInputDto): Promise<ColumnDto> {
    return this.columnService.createColumn(input);
  }

  @Mutation(() => ColumnDto, { name: 'updateColumn' })
  async updateColumn(@Args('input') input: UpdateColumnInputDto): Promise<ColumnDto> {
    return this.columnService.updateColumn(input);
  }

  @Mutation(() => ColumnDto, { name: 'moveColumn' })
  async moveColumn(@Args('input') input: MoveColumnInputDto): Promise<ColumnDto> {
    return this.columnService.moveColumn(input);
  }

  @Mutation(() => Boolean, { name: 'deleteColumn' })
  async deleteColumn(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.columnService.deleteColumn(id);
  }

  @ResolveField(() => [CardDto], { name: 'cards' })
  async getCards(@Parent() column: ColumnDto): Promise<CardDto[]> {
    return this.cardService.getCardsByColumnId(column.id);
  }
} 