import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.entity';
import { Column } from './column.entity';

@ObjectType()
export class Project {
  @Field(() => String)
  id: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  title: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  description: string;

  @Field(() => [Column], { nullable: 'itemsAndList' })
  columns: Column[];

  @Field(() => [User], { nullable: 'itemsAndList' })
  users: User[];

  @Field(() => Date, { description: 'Creation date of the project' })
  createdAt: Date;

  @Field(() => Date, { description: 'Last update date of the project' })
  updatedAt: Date;
}
