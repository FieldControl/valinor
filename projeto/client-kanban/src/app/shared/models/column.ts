import { Task } from "./task"

export interface Column {
  id: number
  description: string
  deleted: boolean
  sequence: number
  tasks: Task[]
}

export interface CreateColumn {
  description: string
}

export interface UpdateColumn {
  id: number
  description?: string
  sequence?: number
  tasks?: Task[]
}