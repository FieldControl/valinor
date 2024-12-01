import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TaskService } from './task.service';
import { Task } from './dtos/task.model';
import { CreateTask } from './dtos/task-create.input';
import { UpdateTask } from './dtos/task-update.input';

@Resolver()
export class TaskResolver {
  constructor(private service: TaskService) { }

  @Mutation(() => Task)
  async createTask(
    @Args('body') body: CreateTask,
  ): Promise<Task> {
    return await this.service.create(body);
  }

  @Mutation(() => Task)
  async updateTask(
    @Args('body') body: UpdateTask,
  ): Promise<Task> {
    return await this.service.update(body);
  }

  @Mutation(() => [Task])
  async manyUpdateTask(
    @Args('body', { type: () => [UpdateTask] }) body: UpdateTask[],
  ): Promise<Task[]> {
    return await this.service.manyUpdate(body);
  }

  @Mutation(() => Task)
  async deleteTask(
    @Args('id') id: number,
  ): Promise<{ id: number }> {
    return await this.service.delete(id);
  }
}
