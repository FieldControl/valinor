import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { KanbanService } from './kanban.service';
import { Card, Column, CreateCardInput, MoveCardInput } from './kanban.types';

@Resolver()
export class KanbanResolver {
  constructor(private readonly service: KanbanService) {}

  @Query(() => [Column])
  columns(): Column[] {
    return this.service.getColumns();
  }

  @Mutation(() => Card)
  createCard(@Args('input') input: CreateCardInput): Card {
    return this.service.createCard(input.columnId, input.title);
  }

  @Mutation(() => Boolean)
  moveCard(@Args('input') input: MoveCardInput): boolean {
    return this.service.moveCard(input.cardId, input.toColumnId, input.newIndex);
  }
}
