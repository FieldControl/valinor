export interface Card {
  id: number;
  title: string;
  description: string;

  columnId: number; // Relaciona o card à coluna a que pertence
}
