import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';


@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Mutation(() => Task)
  createTask(@Args('createTaskInput') createTaskInput: CreateTaskInput) {
    return this.taskService.create(createTaskInput);
  }

  @Query(() => [Task], { name: 'tasks' })
  async getTasks() {
    return this.taskService.findAll();
  }

  @Query(() => Task, { name: 'task' })
getTask(@Args('id', { type: () => Int }) id: number): Task {
  const task = this.taskService.findOne(id);
  if (!task) {
    throw new NotFoundException(`Task #${id} not found`);
  }
  return task;
}

  @Query(() => [Task], { name: 'tasksByStep' })
  getTasksByStep(@Args('step', { type: () => Int }) step: number): Task[] {
    return this.taskService.findTasksByStep(step);
 }

  @Mutation(() => Task)
  updateTask(@Args('updateTaskInput') updateTaskInput: UpdateTaskInput) {
    return this.taskService.update(updateTaskInput.id, updateTaskInput);
  }

  @Mutation(() => Task)
  removeTask(@Args('id', { type: () => Int }) id: number) {
    return this.taskService.remove(id);
  }
}
