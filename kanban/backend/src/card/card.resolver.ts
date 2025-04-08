import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Card } from './card.model';
import { CardService } from './card.service';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';

@Resolver(() => Card)
export class CardResolver {
  constructor(private cardService: CardService) {}

  //Retorna todos os cards
  @Query(() => [Card])
  cards(): Card[] {
    return this.cardService.findAll();
  }

  //Cria um novo card
  @Mutation(() => Card)
  createCard(@Args('input') input: CreateCardInput): Card {
    return this.cardService.create(input);
  }

  //Atualiza um card existente
  @Mutation(() => Card)
  updateCard(
    @Args('id') id: string,
    @Args('title') title: string,
    @Args('description') description: string,
  ): Card {
    return this.cardService.update(id, title, description);
  }

  //Remove um card
  @Mutation(() => Boolean)
  deleteCard(@Args('id') id: string): boolean {
    return this.cardService.delete(id);
  }

  //Move o card para outra coluna
  @Mutation(() => Card)
  moveCard(
    @Args('cardId') cardId: string,
    @Args('columnId') columnId: string,
  ): Card {
    return this.cardService.moveCardToColumn(cardId, columnId);
  }
}
