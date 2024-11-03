import { TaskModel } from "./task.model";

export class LaneModel{
  id!: number;
  name!: string;
  order!: number;
  status!: number;
  tasks: TaskModel[] =[];
  constructor(){
  }
}
