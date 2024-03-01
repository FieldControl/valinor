import { Task } from "./task.model";

export class Column {
  temporaryTaskNames: Task[] = [];
  constructor(public name: string, public tasks: Task[] = []) {}
}
