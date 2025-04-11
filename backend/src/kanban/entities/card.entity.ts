import { ColumnStatus } from './column.entity';

export class Card {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  data: Date;
  status: ColumnStatus;

  constructor(partial: Partial<Card>) {
    Object.assign(this, partial);
  }
}
