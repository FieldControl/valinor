import { Injectable } from '@nestjs/common';
import { Task } from './task.entity'; 

@Injectable()
export class TaskService {
  findAll: () => Promise<Task[]>;
  findOne: (id: number) => Promise<Task>;
  create: (task: Task) => Promise<Task>;
  update: (id: number, task: Task) => Promise<void>;
  remove: (id: number) => Promise<void>;

  
}
