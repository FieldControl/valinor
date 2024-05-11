import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Column } from './card/model/column.model';
import { Card } from './card/model/card.model';
import { ColumnService } from './card/service/column.service';
import { CardService } from './card/service/card.service';


@Resolver(of => Column)
export class ColumnResolver {
  constructor(private readonly columnService: ColumnService) {}

  @Query(returns => [Column])
  async columns(): Promise<Column[]> {
    return this.columnService.getColumns();
  }

  @Mutation(returns => Column)
  async createColumn(@Args('title') title: string): Promise<Column> {
    return this.columnService.createColumn(title);
  }
}

@Resolver(of => Card)
export class CardResolver {
  constructor(private readonly cardService: CardService) {}

  @Query(returns => [Card])
  async cards(): Promise<Card[]> {
    return this.cardService.getCards();
  }

  @Mutation(returns => Card)
  async createCard(@Args('columnId') columnId: number, @Args('title') title: string): Promise<Card> {
    return this.cardService.createCard(columnId, title);
  }
}
