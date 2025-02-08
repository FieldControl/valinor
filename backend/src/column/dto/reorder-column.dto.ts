export class ReordereColumnDto {
  boardId: number;
  items: ReordereColumnItemDto[];
}
export class ReordereColumnItemDto {
  id: number;
  order: number;
}
