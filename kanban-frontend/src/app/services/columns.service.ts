import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KanbanColumn } from '../kanban-column.model';


@Injectable({
  providedIn: 'root',
})
export class ColumnsService {
  private apiUrl = 'http://localhost:3000/columns';

  constructor(private http: HttpClient) {}

  // Buscar todas as colunas (com seus cards)
  getColumns(): Observable<KanbanColumn[]> {
    return this.http.get<KanbanColumn[]>(this.apiUrl);
  }

  // Criar uma nova coluna
  createColumn(title: string): Observable<KanbanColumn> {
    return this.http.post<KanbanColumn>(this.apiUrl, { title });
  }

  // Deletar uma coluna
  deleteColumn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
