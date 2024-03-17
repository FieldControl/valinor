import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { Card } from './cards.entity';
import { CardsService } from './cards.service';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateColumnToCardInput } from './dto/update-card-column.input';
import { UpdateUserToCardInput } from './dto/update-card-user.input';
import { UpdateCardInput } from './dto/update-card.input';

@Resolver('Card')
export class CardsResolver {
  constructor(private cardService: CardsService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [Card])
  async cards(): Promise<Card[]> {
    const cards = await this.cardService.findAllCard();
    return cards;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Card)
  async card(@Args('id') id: string): Promise<Card> {
    const card = await this.cardService.findCardById(id);
    return card;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Card])
  async cardByUserId(@Args('userId') userId: string): Promise<Card[]> {
    const cards = await this.cardService.findCardByUserId(userId);
    return cards;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Card])
  async cardByColumnId(@Args('columnId') columnId: string): Promise<Card[]> {
    const cards = await this.cardService.findCardByColumnId(columnId);
    return cards;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Card)
  async createCard(@Args('data') data: CreateCardInput): Promise<Card> {
    const card = await this.cardService.createCard(data);

    return card;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Card)
  async updateCard(
    @Args('id') id: string,
    @Args('data') data: UpdateCardInput,
  ): Promise<Card> {
    const card = await this.cardService.updateCard(id, data);

    return card;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Card)
  async updateUserToCard(
    @Args('id') id: string,
    @Args('data') data: UpdateUserToCardInput,
  ): Promise<Card> {
    const card = await this.cardService.updateUserToCard(id, data);

    return card;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Card)
  async UpdateColumnToCard(
    @Args('id') id: string,
    @Args('data') data: UpdateColumnToCardInput,
  ): Promise<Card> {
    const card = await this.cardService.updateColumnToCard(id, data);

    return card;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteCard(@Args('id') id: string): Promise<boolean> {
    const deleted = await this.cardService.deleteCard(id);

    return deleted;
  }
}
