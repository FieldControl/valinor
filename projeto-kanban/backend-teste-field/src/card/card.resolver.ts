import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CardService } from './card.service';
import { Card } from './entities/card.entity';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';
import { RemoveCardInput } from './dto/remove-card.input';

@Resolver(() => Card)
export class CardResolver {
	constructor(private readonly cardService: CardService) { }

	@Mutation(() => Card)
	createCard(
		@Args('createCardInput') createCardInput: CreateCardInput,
	): Promise<Card> {
		return this.cardService.create(createCardInput);
	}

	@Query(() => [Card], { name: 'cards' })
	findAll() {
		return this.cardService.findAll();
	}

	@Query(() => Card, { name: 'card', nullable: true })
	findOne(@Args('id', { type: () => Int }) id: number) {
		return this.cardService.findOne(id);
	}

	@Mutation(() => Card)
	updateCard(@Args('updateCardInput') updateCardInput: UpdateCardInput) {
		return this.cardService.update(updateCardInput);
	}

	@Mutation(() => Card)
	removeCard(@Args('removeCardInput') removeCardInput: RemoveCardInput) {
		return this.cardService.remove(removeCardInput);
	}
}
