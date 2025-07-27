import { Injectable } from '@nestjs/common';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  private tasks: Task[] = [];
  private nextId = 1;

  create(createTaskInput: CreateTaskInput): Task {
    const newTask: Task = {
      id: this.nextId++,
      ...createTaskInput,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  findTasksByStep(step: number): Task[] {
    return this.tasks.filter(task => task.step === step);
}

  update(id: number, updateTaskInput: UpdateTaskInput): Task | undefined {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return undefined;

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updateTaskInput,
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  remove(id: number): Task | undefined {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return undefined;

    const [removed] = this.tasks.splice(taskIndex, 1);
    return removed;
  }
}
