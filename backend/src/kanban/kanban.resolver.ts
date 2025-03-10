import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { KanbanService } from './kanban.service';
import { Column, Card } from './kanban.model';

@Resolver((of) => Column)
export class KanbanResolver {
  constructor(private kanbanService: KanbanService) {}

  // Query para pegar as colunas
  @Query((returns) => [Column])
  async getColumns(): Promise<Column[]> {
    const columns = await this.kanbanService.getColumns();
    return columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => ({
        ...card,
        column: { id: column.id, title: column.title, cards: [] },
      })),
    }));
  }

  // Mutation para criar uma coluna
  @Mutation((returns) => Column)
  async createColumn(@Args('title') title: string): Promise<Column> {
    const column = await this.kanbanService.createColumn(title);
    return { ...column, cards: [] };
  }

  // Mutation para atualizar a coluna
  @Mutation((returns) => Column)
  async updateColumn(
    @Args('id') id: number,
    @Args('title') title: string,
  ): Promise<Column> {
    const column = await this.kanbanService.updateColumn(id, title);
    return { ...column, cards: [] };
  }

  // Mutation para deletar a coluna
  @Mutation((returns) => Column)
  async deleteColumn(@Args('id') id: number): Promise<Column> {
    const column = await this.kanbanService.deleteColumn(id);
    return { ...column, cards: [] };
  }

  // Mutation para criar um card
  @Mutation((returns) => Card)
  async createCard(
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('columnId') columnId: number,
  ): Promise<Card> {
    const card = await this.kanbanService.createCard(
      title,
      description,
      columnId,
    );
    return {
      ...card,
      column: { id: columnId, title: '', cards: [] },
    };
  }

  // Mutation para atualizar o card
  @Mutation((returns) => Card)
  async updateCard(
    @Args('cardId') cardId: number,
    @Args('title') title: string,
    @Args('description') description: string,
  ): Promise<Card> {
    const card = await this.kanbanService.updateCard(
      cardId,
      title,
      description,
    );
    return {
      ...card,
      column: { id: card.columnId, title: '', cards: [] },
    };
  }

  // Mutation para deletar o card
  @Mutation((returns) => Card)
  async deleteCard(@Args('cardId') cardId: number): Promise<Card> {
    const card = await this.kanbanService.deleteCard(cardId);
    return {
      ...card,
      column: { id: card.columnId, title: '', cards: [] },
    };
  }
}
