// backend/src/kanban/card.model.ts
export interface Card {
  id: number;
  content: string;
  column: number; // ID da coluna à qual o card pertence
}

// Removed redundant import of 'Card'

// Removed misplaced JSON configuration
