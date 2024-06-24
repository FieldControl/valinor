import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateProjectInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  title: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  description: string;

  @Field(() => [String], {
    description: 'Projects associated with the column',
    nullable: true,
  })
  columnIds?: string[];

  @Field(() => [String], {
    description: 'Projects associated with the user',
    nullable: true,
  })
  userIds?: string[];
}
