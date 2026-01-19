import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KanbanCard } from '../kanban-column.model';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private apiUrl = 'http://localhost:3000/cards';

  constructor(private http: HttpClient) {}

  createCard(data: {
    title: string;
    description?: string;
    priority: string;
    columnId: number;
  }): Observable<KanbanCard> {
    return this.http.post<KanbanCard>(this.apiUrl, data);
  }

  updateCard(
    id: number,
    data: Partial<KanbanCard>
  ): Observable<KanbanCard> {
    return this.http.patch<KanbanCard>(`${this.apiUrl}/${id}`, data);
  }

  updateCardColumn(cardId: number, columnId: number) {
    return this.http.patch(`${this.apiUrl}/${cardId}/column`, {
      columnId,
    });
  }

  deleteCard(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
