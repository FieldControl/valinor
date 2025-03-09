import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { KanbanService } from './kanban.service';
import { Column, Card } from './kanban.model';

@Resolver((of) => Column)
export class KanbanResolver {
  constructor(private kanbanService: KanbanService) {}
  //query para pegar as colunas
  @Query((returns) => [Column])
  async getColumns(): Promise<Column[]> {
    return this.kanbanService.getColumns();
  }
  //mutation para criar uma coluna
  @Mutation((returns) => Column)
  async createColumn(@Args('title') title: string): Promise<Column> {
    return this.kanbanService.createColumn(title);
  }

  // Mutation para atualizar a coluna
  @Mutation((returns) => Column)
  async updateColumn(
    @Args('id') id: number,
    @Args('title') title: string,
  ): Promise<Column> {
    return this.kanbanService.updateColumn(id, title);
  }

  // Mutation para deletar a coluna
  @Mutation((returns) => Column)
  async deleteColumn(@Args('id') id: number): Promise<Column> {
    return this.kanbanService.deleteColumn(id);
  }

  //mutation para criar um card
  @Mutation((returns) => Card)
  async createCard(
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('columnId') columnId: number,
  ): Promise<Card> {
    return this.kanbanService.createCard(title, description, columnId);
  }
  //atualizar o card
  @Mutation((returns) => Card)
  async updateCard(
    @Args('cardId') cardId: number,
    @Args('title') title: string,
    @Args('description') description: string,
  ): Promise<Card> {
    return this.kanbanService.updateCard(cardId, title, description);
  }

  //deletar o card
  @Mutation((returns) => Card)
  async deleteCard(@Args('cardId') cardId: number): Promise<Card> {
    return this.kanbanService.deleteCard(cardId);
  }
}
