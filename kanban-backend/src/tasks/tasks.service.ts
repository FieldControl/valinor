import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotFoundException } from '@nestjs/common';
import { TaskPriority } from './task-priority.enum';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: TaskPriority;
}

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  // Retorna todas as tasks
  getTasks(): Task[] {
    return this.tasks;
  }

  // Cria uma nova task
  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, status, description, priority} = createTaskDto;

    const task: Task = {
      id: Date.now(),
      title,
      description: description ?? '',
      status,
      priority,
    };

    this.tasks.push(task);
    return task;
  }

  //Atualiza o status de uma tarefa
  updateTaskStatus(id: number, status: string): Task {
    const task = this.tasks.find(task => task.id === id);

    if (!task) {
      throw new Error('Task não encontrada');
    }

    task.status = status;
    return task;
  }
  //Atualiza o nome e a descrição da tarefa
  updateTask(id: number, updateTaskDto: UpdateTaskDto) {
  const task = this.tasks.find(t => t.id === id);

  if (!task) {
    throw new Error('Task não encontrada');
  }

  Object.assign(task, updateTaskDto);
  return task;
  }
  //Deleta a tarefa
  deleteTask(id: number) {
  const index = this.tasks.findIndex(task => task.id === id);

  if (index === -1) {
    throw new NotFoundException('Task não encontrada');
  }

  this.tasks.splice(index, 1);
  }

}
