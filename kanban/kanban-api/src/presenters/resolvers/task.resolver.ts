import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TaskService } from '../../application/services/task.service';
import { Task } from '../../domain/entities/task.entity';
import { CreateTaskInput } from '@application/dto/taskDto/create-task.input';
import {
  UpdateTaskInput,
  UpdateTasksInput,
} from '@application/dto/taskDto/update-task.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@guard//auth.guard';
import { Throttle } from '@nestjs/throttler';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  createTask(@Args('createTaskInput') createTaskInput: CreateTaskInput) {
    return this.taskService.create(createTaskInput);
  }

  @Query(() => [Task], { name: 'tasks' })
  findAll() {
    return this.taskService.findAll();
  }

  @Query(() => Task, { name: 'task' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.taskService.findOne(id);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  updateTask(@Args('updateTaskInput') updateTaskInput: UpdateTaskInput) {
    return this.taskService.update(updateTaskInput.id, updateTaskInput);
  }

  @Mutation(() => [Task])
  @UseGuards(AuthGuard)
  updateTasks(@Args('updateTasksInput') updateTasksInput: UpdateTasksInput) {
    return this.taskService.updateMany(updateTasksInput);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  removeTask(@Args('id', { type: () => String }) id: string) {
    return this.taskService.remove(id);
  }
}
