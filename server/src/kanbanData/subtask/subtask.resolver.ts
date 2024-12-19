import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { SubtaskType } from './subtask.type';
import { CreateSubtaskInput } from './create-subtask.input';
import { SubtaskService } from './subtask.service';

@Resolver(() => SubtaskType)
export class SubtaskResolver {
  constructor(private readonly subtaskService: SubtaskService) {}

  // Mutação para criar uma subtask
  @Mutation(() => SubtaskType)
  async createSubtask(
    @Args('createSubtaskInput') createSubtaskInput: CreateSubtaskInput, // Dados de criação
  ): Promise<SubtaskType> {
    const createdSubtask = await this.subtaskService.create(createSubtaskInput); // Criando a subtask
    return {
      id: createdSubtask._id.toString(), // Convertendo o _id para string
      isCompleted: false,
      name: createdSubtask.name,
      task: createdSubtask.task,
    };
  }

  // Query para pegar tarefas por status
  @Query(() => [SubtaskType])
  async getSubtasksByTask(@Args('task') task: string): Promise<SubtaskType[]> {
    return this.subtaskService.findByTask(task); // Chama o serviço para filtrar as tarefas pelo status
  }

  // Mutação para deletar uma subtask
  @Mutation(() => Boolean)
  async deleteSubtask(@Args('id') id: string): Promise<boolean> {
    return this.subtaskService.remove(id); // Deletando a subtask pelo ID
  }

  // Mutação para atualizar uma subtask
  @Mutation(() => Boolean)
  async updateSubtask(
    @Args('id') id: string,
    @Args('isCompleted') isCompleted: boolean,
  ): Promise<boolean> {
    return this.subtaskService.update(id, isCompleted);
  }
}
