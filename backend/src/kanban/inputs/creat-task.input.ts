import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateTaskInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string; // Notas

  @Field({ nullable: true })
  dueDate?: Date; // <--- O CAMPO NOVO QUE FALTAVA

  @Field(() => Int)
  order: number;

  @Field()
  columnId: string;
}