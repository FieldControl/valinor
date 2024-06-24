import { IColumn } from './column.interfaces';
import { IUser } from './user.interface';

export interface IProject {
  id: string;
  title: string;
  description: string;
  updatedAt: string;

  users?: IUser[];
  columns?: IColumn[];
}

export type TProjectCreateFormData = Omit<IProject, 'id'>;
