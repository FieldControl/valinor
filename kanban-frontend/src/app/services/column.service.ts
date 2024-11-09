import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KanbanColumn } from '../models/kanban-column.model';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  private apiUrl = 'http://localhost:3000/columns';

  constructor(private http: HttpClient) {}

  getColumns(): Observable<KanbanColumn[]> {
    return this.http.get<KanbanColumn[]>(this.apiUrl);
  }

  createColumn(column: Partial<KanbanColumn>): Observable<KanbanColumn> {
    return this.http.post<KanbanColumn>(this.apiUrl, column);
  }

  updateColumn(id: number, column: Partial<KanbanColumn>): Observable<KanbanColumn> {
    return this.http.put<KanbanColumn>(`${this.apiUrl}/${id}`, column);
  }

  deleteColumn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
