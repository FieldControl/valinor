import { Injectable } from "@nestjs/common";
import { Column } from "../model/column.model";

@Injectable()
export class ColumnService {
  
  private columns: Column[] = [];
  private lastId: number = 0;

  generateId(): number {
    return ++this.lastId;
  }
  async createInitialColumns(): Promise<void> {
    console.log(this.columns.length === 0);
    if (this.columns.length === 0) {
      await this.createColumn("Suggestions");
      await this.createColumn("In Progress");
      await this.createColumn("To Do");
      await this.createColumn("Done");
    }
  }

  async init(): Promise<void> {
    await this.createInitialColumns();
  }

  async createColumn(title: string): Promise<Column> {
    const newColumn: Column = {
      id: this.generateId(),
      title,
      cards: [] 
    };

    this.columns.push(newColumn);

    return newColumn;
  }

  async getColumns(): Promise<Column[]> {
    return this.columns;
  }
  
  async updateColumnTitle(columnId: number, newTitle: string): Promise<Column> {
    const column = this.columns.find(column => columnId == column.id);

    if (!column) {
      throw new Error('Column not found');
    }

    column.title = newTitle;

    return column;
  }

}