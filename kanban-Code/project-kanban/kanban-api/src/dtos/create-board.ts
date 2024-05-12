import { IsNotEmpty } from "class-validator";

export class Task {
    text: string;
    id: number;
    columnId:number;

  }
  
  export class Columns {
    id: number;
    name: string;
    tasks: Task[];
    boardId:number;
  }
  
  export class CreateBoards {
    id: number;
    name: string;
    columns: Columns[];
  }