import { Injectable } from '@angular/core';
import axios from 'axios';
import { Column } from '../models/column.model';
import { environment } from '../environments/enviroment';
import { BehaviorSubject } from 'rxjs';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {
  private apiUrl = `${environment.apiUrl}/columns`;
  private columnsSource = new BehaviorSubject<Column[]>([]);
  public columns$ = this.columnsSource.asObservable();

  constructor(private taskService: TaskService) {
    this.loadInitialColumns();
  }

  private async loadInitialColumns() {
    try {
      const columns = await this.getColumns();
      this.columnsSource.next(columns);
    } catch (error) {
      console.error('Error loading initial columns:', error);
      throw error;
    }
  }

  async createColumn(columnName: string): Promise<Column> {
    try {
      const response = await axios.post<Column>(this.apiUrl, { name: columnName });
      const newColumn = {...response.data,
        tasks: []
      }

      const currentColumns = this.columnsSource.value;
      this.columnsSource.next([...currentColumns, newColumn]);

      return newColumn;
    } catch (error) {
      console.error('Error creating column:', error);
      throw error;
    }
  }

  async getColumns(withTasks: boolean = false): Promise<Column[]> {
    try {
      const response = await axios.get<Column[]>(this.apiUrl);
      let columns = response.data;

      if (withTasks) {
        columns = await this.enrichColumnsWithTasks(columns);
      }

      return columns;
    } catch (error) {
      console.error('Error fetching columns:', error);
      throw error;
    }
  }

  private async enrichColumnsWithTasks(columns: Column[]): Promise<Column[]> {
    return Promise.all(
      columns.map(async column => {
        const tasks = await this.taskService.getTasksByColumn(column.id);
        return {
          ...column,
          tasks: tasks || []
        };
      })
    );
  }

  async deleteColumn(columnId: string): Promise<void> {
    try {
      if (!columnId) {
        throw new Error('Column ID is required');
      }

      await axios.delete(`${this.apiUrl}/${columnId}`);

      const updatedColumns = this.columnsSource.value.filter(column => column.id !== columnId);
      this.columnsSource.next(updatedColumns);

      return;

    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }


  async addTaskToColumn(columnId: string, task: Task) {
  const currentColumns = this.columnsSource.value;
  const updatedColumns = currentColumns.map(column => {
    if (column.id === columnId) {
      return {
        ...column,
        tasks: [...(column.tasks || []), task]
      };
    }
    return column;
  });
  this.columnsSource.next(updatedColumns);
}

  async loadColumnsWithTasks() {
  try {
    const columns = await this.getColumns(true);
    this.columnsSource.next(columns);
  } catch (error) {
    console.error('Error loading columns with tasks:', error);
    throw error;
  }
}

  async updateColumnName(columnId: string, updatedData: { name: string }): Promise < Column > {
  try {
    const response = await axios.put<Column>(`${this.apiUrl}/${columnId}`, updatedData)

      return response.data

  } catch(error) {
    console.log('Error updating name column', error)
    throw error
  }
}
}