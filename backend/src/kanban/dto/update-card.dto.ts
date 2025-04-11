export class UpdateCardDto {
  nome?: string;
  descricao?: string;
  categoria?: string;
  data?: string;
  status?: 'Pendente' | 'Fazendo' | 'Finalizado';
}

