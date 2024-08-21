export class ReordenarColunaDto {
  quadroId: number;
  itens: ReordenarItemColunaDto[];
}
export class ReordenarItemColunaDto {
  id: number;
  ordem: number;
}
