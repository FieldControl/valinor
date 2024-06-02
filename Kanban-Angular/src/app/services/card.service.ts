import { HttpClient } from '@angular/common/http'; // Importa o módulo HttpClient para realizar requisições HTTP
import { Injectable, inject } from '@angular/core'; // Importa os módulos Injectable e inject
import { Observable } from 'rxjs'; // Importa o módulo Observable do RxJS
import { ICard } from '../Models/board-model'; // Importa o tipo ICard

@Injectable({
  providedIn: 'root',
})
export class CardService {
  http = inject(HttpClient); // Injeta o serviço HttpClient para realizar requisições HTTP

  // Método para atualizar as ordens e as swimlanes dos cards em um quadro
  updateCardOrdersAndSwimlanes(
    boardId: number, // ID do quadro
    cards: ICard[] // Lista de cards a serem atualizados
  ): Observable<ICard[]> {
    return this.http.put<ICard[]>('/api/card/update-order', { // Envia uma requisição PUT para atualizar as ordens e as swimlanes dos cards
      boardId, // Envia o ID do quadro
      cards, // Envia a lista de cards
    });
  }

  // Método para criar um novo card
  createCard(createCard: Partial<ICard>): Observable<ICard> {
    return this.http.post<ICard>('/api/card', createCard); // Envia uma requisição POST para criar um novo card
  }

  // Método para atualizar um card existente
  updateCard(id: number, createCard: Partial<ICard>): Observable<ICard> {
    return this.http.patch<ICard>(`/api/card/${id}`, createCard); // Envia uma requisição PATCH para atualizar um card existente
  }

  // Método para excluir um card
  deleteCard(cardId: number): Observable<void> {
    return this.http.delete<void>(`/api/card/${cardId}`); // Envia uma requisição DELETE para excluir um card
  }

  // Método para obter os detalhes de um card pelo ID
  getCardById(id: number): Observable<ICard> {
    return this.http.get<ICard>(`/api/card/${id}`); // Envia uma requisição GET para obter os detalhes de um card pelo ID
  }

  // Método para obter todos os cards
  getCards(): Observable<ICard[]> {
    return this.http.get<ICard[]>('/api/card'); // Envia uma requisição GET para obter todos os cards
  }
}
