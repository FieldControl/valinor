import { Task } from "./task"

export interface Column {
  id: number
  description: string
  deleted: boolean
  tasks: Task[]
}
