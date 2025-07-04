export enum StatusTarefa {
  PENDENTE = 0,
  EM_ANDAMENTO = 1,
  CONCLUIDA = 2
}

export interface Task {
  id: number;
  titulo: string;
  descricao?: string;
  status: StatusTarefa;
}