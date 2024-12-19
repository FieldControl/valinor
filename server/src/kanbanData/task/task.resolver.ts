import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { TaskType } from './task.type';
import { CreateTaskInput } from './create-task.input';
import { TaskService } from './task.service';

@Resolver(() => TaskType)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  // Mutação para criar uma task
  @Mutation(() => TaskType)
  async createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskInput,
  ): Promise<TaskType> {
    const createdTask = await this.taskService.create(createTaskInput);
    return {
      id: createdTask._id.toString(), // Convertendo o _id do MongoDB para string
      name: createdTask.name,
      description: createdTask.description,
      status: createdTask.status,
    };
  }

  // Query para pegar tarefas por status
  @Query(() => [TaskType])
  async getTasksByStatus(@Args('status') status: string): Promise<TaskType[]> {
    return this.taskService.findByStatus(status); // Chama o serviço para filtrar as tarefas pelo status
  }

  // Mutação para deletar uma task
  @Mutation(() => Boolean)
  async deleteTask(@Args('id') id: string): Promise<boolean> {
    return this.taskService.removeTaskAndSubtasks(id); // Deletando a task
  }

  // Mutação para deletar as tasks das colunas
  @Mutation(() => Boolean)
  async deleteTaskByStatus(@Args('status') status: string): Promise<boolean> {
    return this.taskService.removeMany(status); // Deletando as tasks
  }

  // Mutação para atualizar o nome da task
  @Mutation(() => Boolean)
  async updateName(
    @Args('id') id: string,
    @Args('newName') newName: string,
  ): Promise<boolean> {
    return this.taskService.updateName(id, newName);
  }

  // Mutação para atualizar o status da task
  @Mutation(() => Boolean)
  async updateStatus(
    @Args('id') id: string,
    @Args('newStatus') newStatus: string,
  ): Promise<boolean> {
    return this.taskService.updateStatus(id, newStatus);
  }

  // Mutação para atualizar o nome da task
  @Mutation(() => Boolean)
  async updateDescription(
    @Args('id') id: string,
    @Args('newDescription') newDescription: string,
  ): Promise<boolean> {
    return this.taskService.updateDescription(id, newDescription);
  }
}
