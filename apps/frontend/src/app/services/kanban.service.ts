// Angular Core
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Models
import {
  Column,
  Card,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateCardRequest,
  UpdateCardRequest,
  ColumnPositionUpdate,
  CardPositionUpdate,
  MoveCardRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all columns with their cards
   */
  getColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(`${this.apiUrl}/columns`);
  }

  /**
   * Get a specific column by ID
   */
  getColumn(id: number): Observable<Column> {
    return this.http.get<Column>(`${this.apiUrl}/columns/${id}`);
  }

  /**
   * Create a new column
   */
  createColumn(column: CreateColumnRequest): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/columns`, column);
  }

  /**
   * Update an existing column
   */
  updateColumn(id: number, column: UpdateColumnRequest): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/columns/${id}`, column);
  }

  /**
   * Delete a column
   */
  deleteColumn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/columns/${id}`);
  }

  /**
   * Update column positions
   */
  updateColumnPositions(columns: ColumnPositionUpdate[]): Observable<Column[]> {
    return this.http.patch<Column[]>(
      `${this.apiUrl}/columns/positions/update`,
      columns
    );
  }

  /**
   * Get all cards
   */
  getCards(columnId?: number): Observable<Card[]> {
    let params = new HttpParams();
    if (columnId) {
      params = params.set('columnId', columnId.toString());
    }
    return this.http.get<Card[]>(`${this.apiUrl}/cards`, { params });
  }

  /**
   * Get a specific card by ID
   */
  getCard(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/cards/${id}`);
  }

  /**
   * Create a new card
   */
  createCard(card: CreateCardRequest): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/cards`, card);
  }

  /**
   * Update an existing card
   */
  updateCard(id: number, card: UpdateCardRequest): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/cards/${id}`, card);
  }

  /**
   * Delete a card
   */
  deleteCard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cards/${id}`);
  }

  /**
   * Move a card to a different column
   */
  moveCard(cardId: number, moveData: MoveCardRequest): Observable<Card> {
    return this.http.patch<Card>(
      `${this.apiUrl}/cards/${cardId}/move`,
      moveData
    );
  }

  /**
   * Update card positions
   */
  updateCardPositions(cards: CardPositionUpdate[]): Observable<Card[]> {
    return this.http.patch<Card[]>(
      `${this.apiUrl}/cards/positions/update`,
      cards
    );
  }

  /**
   * Get the API health status
   */
  getHealth(): Observable<{ status: string; message: string }> {
    return this.http.get(`${this.apiUrl}`);
  }
}
