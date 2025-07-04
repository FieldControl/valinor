import { Task } from "./task";

export interface TaskDialogResult {
  task: Task;
  delete?: boolean;
}
