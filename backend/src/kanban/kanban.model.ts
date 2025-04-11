export interface Kanban {
  id: number; // ID único da coluna
  title: string; // Título da coluna
  cards: string[]; // Lista de cards (strings) na coluna
}
