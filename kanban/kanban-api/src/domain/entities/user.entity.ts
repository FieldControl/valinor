import { ObjectType, Field } from '@nestjs/graphql';
import { Project } from './project.entity';

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  name: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  email: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  password: string;

  @Field(() => [Project], { nullable: 'itemsAndList' })
  projects: Project[];

  @Field(() => Date, { description: 'Creation date of the project' })
  createdAt: Date;

  @Field(() => Date, { description: 'Last update date of the project' })
  updatedAt: Date;
}
