import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Task } from './task.entity';
import { Project } from './project.entity';

@ObjectType()
export class Column {
  @Field(() => String)
  id: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  title: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  description: string;

  @Field(() => Project, { nullable: true })
  project: Project;

  @Field(() => [Task], { nullable: 'itemsAndList' })
  tasks: Task[];

  @Field(() => Date, { description: 'Creation date of the project' })
  createdAt: Date;

  @Field(() => Date, { description: 'Last update date of the project' })
  updatedAt: Date;

  @Field(() => Int, { description: 'Order of the column' })
  order: number;
}
