// ARQUIVO: api.service.ts (ou api.ts)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * ApiService
 * Este serviço é o único ponto de comunicação entre o frontend (Angular)
 * e o nosso backend (NestJS). Ele encapsula toda a lógica de chamadas HTTP.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * A URL base da API no backend.
   * Usar uma constante aqui facilita a mudança caso a URL da API mude no futuro.
   */
  private readonly apiUrl = 'http://localhost:3000';

  /**
   * Injeta o HttpClient, o serviço padrão do Angular para fazer requisições web.
   * @param http - A instância do HttpClient.
   */
  constructor(private http: HttpClient) { }

  // =======================================================
  // --- MÉTODOS RELACIONADOS ÀS COLUNAS (COLUMNS) ---
  // =======================================================

  /**
   * Busca todas as colunas de um quadro (board) específico.
   * @param boardId - A ID do quadro cujas colunas queremos buscar.
   * @returns Um Observable contendo um array de colunas.
   */
  getColumns(boardId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/columns?boardId=${boardId}`);
  }

  /**
   * Cria uma nova coluna no backend.
   * @param columnData - Um objeto contendo o nome da nova coluna e a ID do quadro.
   * @returns Um Observable com a nova coluna criada pelo backend (incluindo sua nova ID).
   */
  createColumn(columnData: { name: string; boardId: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/columns`, columnData);
  }

  /**
   * Deleta uma coluna específica pela sua ID.
   * @param columnId - A ID da coluna a ser deletada.
   * @returns Um Observable com a resposta de sucesso do backend.
   */
  deleteColumn(columnId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/columns/${columnId}`);
  }

  // =======================================================
  // --- MÉTODOS RELACIONADOS AOS CARDS (CARDS) ---
  // =======================================================

  /**
   * Busca todos os cards de uma coluna específica.
   * @param columnId - A ID da coluna cujos cards queremos buscar.
   * @returns Um Observable contendo um array de cards.
   */
  getCards(columnId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cards?columnId=${columnId}`);
  }

  /**
   * Cria um novo card no backend.
   * @param cardData - Um objeto com os dados do novo card (título, prioridade, ID da coluna).
   * @returns Um Observable com o novo card criado pelo backend.
   */
  createCard(cardData: { title: string, columnId: number, badge: 'low' | 'medium' | 'high' }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cards`, cardData);
  }

  /**
   * Atualiza um card existente, geralmente para mover entre colunas.
   * @param cardId - A ID do card a ser atualizado.
   * @param updates - Um objeto contendo os campos a serem atualizados (ex: { columnId: 2 }).
   * @returns Um Observable com o card atualizado.
   */
  updateCard(cardId: number, updates: { columnId: number }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cards/${cardId}`, updates);
  }
  
  /**
   * Deleta um card específico pela sua ID.
   * @param cardId - A ID do card a ser deletado.
   * @returns Um Observable com a resposta de sucesso do backend.
   */
  deleteCard(cardId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/${cardId}`);
  }
}