import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CardsService } from './cards.service';
import { Card } from './cards.entity';
import { BadRequestException } from '@nestjs/common';

@Resolver(() => Card)
export class CardsResolver {
  constructor(private readonly cardsService: CardsService) {}

  @Query(() => [Card], { name: 'cardsByColumn' })
  findByColumn(@Args('columnId') columnId: string) {
    return this.cardsService.findByColumn(columnId);
  }

  @Mutation(() => Card)
  createCard(
    @Args('content') content: string,
    @Args('columnId') columnId: string,
  ) {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Por favor, preencha o conteúdo do card.');
    }
    return this.cardsService.create(content, columnId);
  }

  @Mutation(() => Card)
  updateCard(@Args('id') id: string, @Args('content') content: string) {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('O campo de conteúdo não pode ficar vazio.');
    }
    return this.cardsService.update(id, content);
  }

  @Mutation(() => Card)
  moveCard(@Args('id') id: string, @Args('newColumnId') newColumnId: string) {
    return this.cardsService.move(id, newColumnId);
  }

  @Mutation(() => Boolean)
  deleteCard(@Args('id') id: string) {
    return this.cardsService.remove(id);
  }
}
