import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { KanbanService } from '../../kanban.service';
import { CardModel } from '../models/card.model';
import { CreateCardInput } from '../dto/create-card.input';
import { UpdateCardInput } from '../dto/update-card.input';

@Resolver(() => CardModel)
export class KanbanResolver {
  constructor(private readonly kanbanService: KanbanService) {}

  // Query para buscar todos os cards de uma coluna
  @Query(() => [CardModel])
  async getCardsByColumnId(
    @Args('columnId', { type: () => Int }) columnId: number,
  ): Promise<CardModel[]> {
    return this.kanbanService.getCardsByColumnId(columnId);
  }

  // Mutation para criar um card
  @Mutation(() => CardModel)
  async createCard(@Args('data') input: CreateCardInput): Promise<CardModel> {
    return this.kanbanService.createCard(input);
  }

  // Mutation para atualizar um card
  @Mutation(() => CardModel)
  async updateCard(@Args('data') data: UpdateCardInput): Promise<CardModel> {
    return this.kanbanService.updateCard(data);
  }

  // Mutation para deletar um card
  @Mutation(() => Boolean)
  async deleteCard(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.kanbanService.deleteCard(id);
  }
}
