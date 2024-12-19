import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SubtaskType {
  @Field()
  id: string; 

  
  @Field()
  isCompleted: boolean;

  @Field()
  name: string;

  @Field()
  task: string; 
}
