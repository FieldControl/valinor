export class ReordereSwimlaneDto {
  boardCod: number;
  id: ReordereSwimlaneItemDto[];
}

export class ReordereSwimlaneItemDto {
  id: number;
  order: number;
}
