export class ReordereSwimlaneDto {
  boardId: number;
  items: ReordereSwimlaneItemDto[];
}
export class ReordereSwimlaneItemDto {
  id: number;
  order: number;
}
