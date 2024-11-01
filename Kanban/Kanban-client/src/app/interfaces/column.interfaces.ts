import { ITask } from './task.interfaces';

export interface IColumn {
  id: string;
  title: string;
  description: string;
  updatedAt: string;

  projectId?: string;
  tasks: ITask[];

  order: number;
}

export type TColumnCreateFormData = Omit<IColumn, 'id'>;
