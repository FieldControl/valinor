import { Task } from "./task.model"

export interface Column {
  id: string
  name: string
  order?: number
  tasks: Task[]
}