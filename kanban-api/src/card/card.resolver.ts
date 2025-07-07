
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Card } from './card.entity';
import { CardService } from './card.service';

@Resolver(() => Card)
export class CardResolver {
  constructor(private readonly cardService: CardService) {}

  @Query(() => [Card], { name: 'cards' })
  async getCards() {
    return this.cardService.findAllCards();
  }

  @Query(() => Card, { name: 'card' })
  async getCardById(@Args('id', { type: () => Int }) id: number) {
    return this.cardService.findCardById(id);
  }

  @Mutation(() => Card)
  async createCard(
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('columnId', { type: () => Int }) columnId: number,
    @Args('order', { type: () => Int, nullable: true }) order?: number,
  ) {
    return this.cardService.createCard(
      title,
      description,
      columnId,
      order ? order : 0,
    );
  }

  @Mutation(() => Card)
  async updateCard(
    @Args('id', { type: () => Int }) id: number,
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('columnId', { type: () => Int }) columnId: number,
  ) {
    return this.cardService.updateCard(id, title, description, columnId);
  }

  @Mutation(() => Boolean)
  async deleteCard(@Args('id', { type: () => Int }) id: number) {
    return this.cardService.deleteCard(id);
  }

  @Mutation(() => Card)
  async moveCard(
    @Args('id', { type: () => Int }) id: number,
    @Args('columnId', { type: () => Int }) columnId: number,
  ) {
    return this.cardService.moveCard(id, columnId);
  }

  @Mutation(() => Card)
  async reorderCard(
    @Args('id', { type: () => Int }) id: number,
    @Args('newIndex', { type: () => Int }) newIndex: number,
  ) {
    return this.cardService.reorderCard(id, newIndex);
  }
}
