import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICard } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  http = inject(HttpClient);
// Método para atualizar a ordem dos cartões e das colunas no frontend
  updateCardOrderAndSwimlanes(
    boardId: number,
    cards: ICard[]
  ): Observable<ICard[]> {
    return this.http.put<ICard[]>('/api/card/update-order', {
      boardId,
      cards
    });
  }
// Método para criar um novo cartão no frontend
  criarCard(createCard: Partial<ICard>): Observable<ICard> {
    return this.http.post<ICard>('/api/card', createCard);
  }
  // Método para atualizar um cartão no frontend 
  atualizarCard(id: number, createCard: Partial<ICard>): Observable<ICard> {
    return this.http.patch<ICard>(`/api/card/${id}`, createCard);
  }
  // Método para deletar um cartão no frontend
  deletarCard(cardId: number): Observable<void> {
    return this.http.delete<void>(`/api/card/${cardId}`);
  }
  // Método para obter um cartão por id no frontend 
  getCardById(id: number): Observable<ICard> {
    return this.http.get<ICard>(`/api/card/${id}`);
  }
  // Método para obter todos os cartões no frontend
  getCards(): Observable<ICard[]> {
    return this.http.get<ICard[]>('/api/card');
  }
}
