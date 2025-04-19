export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  priorityLevel: number;
  initDate:Date;
  endDate?:Date;
}
