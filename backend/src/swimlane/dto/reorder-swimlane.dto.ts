//Reorder swimlanes class
export class ReordereSwimlaneDto {
  boardId: number;
  items: ReordereSwimlaneItemDto[];
}

//Reorder swimlane item class
export class ReordereSwimlaneItemDto {
  id: number;
  order: number;
}
