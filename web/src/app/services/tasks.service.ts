import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ColumnsService } from './columns.service';
import { Task } from '../types/task.interface';
import { CreateTaskDto } from '../types/dtos/create-task.dto';
import { UpdateTaskDto } from '../types/dtos/update-task.dto';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  readonly url = 'http://localhost:3000/tasks';

  constructor(
    private httpClient: HttpClient,
    private columnsService: ColumnsService
  ) {}

  createTask(createTaskDto: CreateTaskDto) {
    this.httpClient.post<Task>(`${this.url}`, createTaskDto).subscribe(() => {
      this.columnsService.fetchColumns();
    });
  }

  updateTask(taskId: string, updateTaskDto: UpdateTaskDto) {
    this.httpClient
      .patch<Task>(`${this.url}/${taskId}`, updateTaskDto)
      .subscribe(() => {
        this.columnsService.fetchColumns();
      });
  }

  deleteTask(taskId: string) {
    this.httpClient.delete(`${this.url}/${taskId}`).subscribe(() => {
      this.columnsService.fetchColumns();
    });
  }
}
