import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Icard } from '../../interfaces/card.interface';


@Injectable({
  providedIn: 'root',
})
export class CardService {
  http = inject(HttpClient);

  updateCardOrdersAndSwimlanes(boardId: number,cards: Icard[]): Observable<Icard[]> {
    return this.http.put<Icard[]>('http://localhost:3000/card/update-order', { 
      boardId,
      cards,
    });
  }
  createCard(createCard: Partial<Icard>): Observable<Icard> {
    return this.http.post<Icard>('http://localhost:3000/card', createCard);
  }
  updateCard(id: number, createCard: Partial<Icard>): Observable<Icard> {
    return this.http.patch<Icard>(`http://localhost:3000/card/${id}`, createCard);
  }
  deleteCard(cardId: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/card/${cardId}`);
  }
  getCardById(id: number): Observable<Icard> {
    return this.http.get<Icard>(`http://localhost:3000/card/${id}`);
  }
  getCards(): Observable<Icard[]> {
    return this.http.get<Icard[]>('http://localhost:3000/card');
  }
}