export interface Task {
  id: number
  id_column: number
  sequence: number
  description: string
  deleted: boolean
}

export interface CreateTask {
  description: string;
  id_column: number;
}

export interface UpdateTask {
  id: number
  description: string;
  id_column: number;
}