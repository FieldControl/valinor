import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, mergeMap, switchMap } from 'rxjs';
import { Column } from '../column/column';
import { Card } from '../../cards/card';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {
  private apiUrl = 'http://localhost:3000/columns';

  constructor(private http: HttpClient) { }

  getColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(this.apiUrl);
  }

  getColumn(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createColumn(column: Column): Observable<Column> {
    return this.http.post<Column>(this.apiUrl, column);
  }

  updateColumnToAddCard(columnId: number, newCard: Partial<Card>): Observable<Column> {
    const url = `${this.apiUrl}/${columnId}`;
    return this.http.patch<Column>(url, { card: newCard });
  }

  updateColumn(id: number, column: Column): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/${id}`, column);
  }

  deleteColumn(id: number): Observable<Column> {
    const url = `${this.apiUrl}/${id}`
    return this.http.delete<Column>(url)
  }

  addCard(columnId: number, newCard: Card): Observable<Column> {
    return this.getColumn(columnId).pipe(
      switchMap(column => {
        column.cards.push(newCard);
        return this.updateColumn(columnId, column);
      })
    );
  }
}
