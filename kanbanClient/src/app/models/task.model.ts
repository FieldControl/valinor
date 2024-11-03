export class TaskModel{
  id: number;
  title: string;
  description: string;
  status: number;
  taskStatus: number;
  laneId: number;
  targetDate: Date;
  constructor(){
    this.id = 0;
    this.title = '';
    this.description = '';
    this.status = 0;
    this.taskStatus = 0;
    this.laneId = 0;
    this.targetDate = new Date();
  }
}
