import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCardInput {
	@Field()
	title: string;

	@Field({ nullable: true })
	description?: string;

	@Field(() => Int)
	columnId: number;
}
