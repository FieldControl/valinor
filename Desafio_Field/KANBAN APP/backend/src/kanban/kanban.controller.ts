// backend/src/kanban/kanban.controller.ts
export interface Column {
  id: string;
  title: string;
}

export class KanbanController {
  // Add your methods here

  async createColumn(title: string): Promise<Column> {
    // Implement the logic to create a column
    const newColumn: Column = { id: Date.now().toString(), title };
    return newColumn;
  }
}