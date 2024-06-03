export class ReordereColunaDto {
    quadroId: number;
    items: ReordereColunaItemDto[];
  }
  export class ReordereColunaItemDto {
    id: number;
    ordem: number;
  }