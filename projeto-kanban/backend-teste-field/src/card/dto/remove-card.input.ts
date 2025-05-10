import { CreateCardInput } from './create-card.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class RemoveCardInput extends PartialType(CreateCardInput) {
    @Field(() => Int)
    id: number;
}
