import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { KanbanService } from '../../kanban.service';
import { CardModel } from '../models/card.model';
import { CreateCardInput } from '../dto/create-card.input';
import { UpdateCardInput } from '../dto/update-card.input';
import { KanbanGateway } from '../../gateway/kanban.gateway';

@Resolver(() => CardModel)
export class KanbanResolver {
  constructor(
    private readonly kanbanService: KanbanService,
    private readonly kanbanGateway: KanbanGateway,
  ) {}

  // Query para buscar todos os cards de uma coluna
  @Query(() => [CardModel])
  async getCardsByColumnId(
    @Args('columnId', { type: () => Int }) columnId: number,
  ): Promise<CardModel[]> {
    return this.kanbanService.getCardsByColumnId(columnId);
  }

  // Query para buscar um card pelo id
  @Query(() => CardModel)
  async getCard(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CardModel> {
    return this.kanbanService.getCard(id);
  }

  // Mutation para criar um card
  @Mutation(() => CardModel)
  async createCard(@Args('data') input: CreateCardInput): Promise<CardModel> {
    const card = await this.kanbanService.createCard(input);
    this.kanbanGateway.emitCardCreated(card);
    return card;
  }

  // Mutation para atualizar um card
  @Mutation(() => CardModel)
  async updateCard(@Args('data') data: UpdateCardInput): Promise<CardModel> {
    const card = await this.kanbanService.updateCard(data);
    this.kanbanGateway.emitCardUpdated(card);
    return card;
  }

  // Mutation para deletar um card
  @Mutation(() => Boolean)
  async deleteCard(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    const success = await this.kanbanService.deleteCard(id);
    if (success) {
      this.kanbanGateway.emitCardDeleted(id);
    }
    return success;
  }
}
