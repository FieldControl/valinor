import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Card } from './card.model';
import { CardService } from './card.service';
import { ColumnService } from '../column/column.service';

@Resolver(() => Card)
export class CardResolver {
  constructor(
    private cardService: CardService,
    private columnService: ColumnService,
  ) {}

  //Bloco de mutation para criar um novo card e associá-lo a uma coluna
  @Mutation(() => Card)
  createCard(
    @Args('columnId') columnId: string, //ID da coluna onde o card será adicionado
    @Args('title') title: string,
    @Args('description') description: string,
  ): Card {
    const newCard = this.cardService.createCard(title, description);

    //Esta linha associa o novo card à coluna correspondente
    this.columnService.addCardToColumn(columnId, newCard);

    return newCard;
  }
}
