import { Task } from "./task";

export interface TaskDialogData {
  task: Partial<Task>;
  enableDelete: boolean;
}