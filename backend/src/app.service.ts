import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
export interface Tasks {
  id: number;
  name: string;
  completed: boolean;
}
@Injectable()
export class AppService {
  private tasks: Array<Tasks>;
  constructor() {
    this.tasks = JSON.parse(fs.readFileSync('tasks.json', 'utf8'));
  }
  getTasks(): Tasks[] {
    return this.tasks;
  }
  createTask(name: string): Tasks[] {
    const task = { id: this.tasks.length + 1, name, completed: false };
    this.tasks = [...this.tasks, { ...task}];
    fs.writeFileSync('tasks.json', JSON.stringify(this.tasks));
    return this.tasks;
  }
  deleteTask(id: number): Tasks[] {
    const index = this.tasks.findIndex((task) => task.id === id);
    this.tasks.splice(index, 1);
    return this.tasks;
  }
}