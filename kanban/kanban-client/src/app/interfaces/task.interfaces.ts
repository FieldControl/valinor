export interface ITask {
  createTask: ITask | undefined;
  data: ITask | undefined;
  id: string;
  title: string;
  description: string;
  updatedAt: string;

  column: {
    id: string;
    title: String;
  };

  order: number;
}

export type TColumnCreateFormData = Omit<ITask, 'id'>;
