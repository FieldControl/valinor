import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICard } from './models/quadro.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  http = inject(HttpClient);

  updateCardOrdemEColunas(
    quadroId: number,
    cards: ICard[]
  ): Observable<ICard[]> {
    return this.http.put<ICard[]>('/api/card/update-order', {
      quadroId,
      cards,
    });
  }

  createCard(createCard: Partial<ICard>): Observable<ICard> {
    return this.http.post<ICard>('/api/card', createCard);
  }
  updateCard(id: number, createCard: Partial<ICard>): Observable<ICard> {
    return this.http.patch<ICard>(`/api/card/${id}`, createCard);
  }
  deleteCard(cardId: number): Observable<void> {
    return this.http.delete<void>(`/api/card/${cardId}`);
  }
  getCardById(id: number): Observable<ICard> {
    return this.http.get<ICard>(`/api/card/${id}`);
  }
  getCards(): Observable<ICard[]> {
    return this.http.get<ICard[]>('/api/card');
  }
}
