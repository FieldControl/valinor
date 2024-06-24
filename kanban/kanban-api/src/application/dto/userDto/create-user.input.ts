import { Project } from '@domain/entities/project.entity';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'Example field (placeholder)' })
  name: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  email: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  password: string;

  @Field(() => [String], {
    description: 'User associated with the projects',
    nullable: true,
  })
  projectIds?: string[];
}
