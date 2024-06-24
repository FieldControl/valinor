import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateColumnInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  title: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  description: string;

  @Field(() => String, {
    description: 'User associated with the projects',
    nullable: true,
  })
  projectId: string;

  @Field(() => [String], {
    description: 'User associated with the projects',
    nullable: true,
  })
  taskIds: string[];

  @Field(() => Int, {
    description: 'Order of the column',
    nullable: true,
  })
  order?: number;
}
