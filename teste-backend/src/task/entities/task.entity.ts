import { ObjectType, Field, Int} from '@nestjs/graphql';

@ObjectType()
export class Task {
  @Field(() => Int, { description: 'Id of the task' })
  id: number;

  @Field(() => String, { description: 'Name of the task'})
  name: string;

  @Field(() => String, { description: 'Description of the task'})
  desc: string;

  @Field(() => Int, { description: 'Step of the task'})
  step: number;
}
