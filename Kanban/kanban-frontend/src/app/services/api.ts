import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// ✅ 1. Importa o nosso ficheiro de configuração de ambiente.
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // ✅ 2. A URL base agora vem dinamicamente do ficheiro de ambiente.
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // --- MÉTODOS PARA AS COLUNAS ---
  getColumns(boardId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/columns?boardId=${boardId}`);
  }

  createColumn(columnData: { name: string; boardId: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/columns`, columnData);
  }

  deleteColumn(columnId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/columns/${columnId}`);
  }

  // --- MÉTODOS PARA OS CARDS ---
  getCards(columnId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cards?columnId=${columnId}`);
  }

  createCard(cardData: { title: string, columnId: number, badge: 'low' | 'medium' | 'high' }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cards`, cardData);
  }

  updateCard(cardId: number, updates: { columnId: number }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cards/${cardId}`, updates);
  }
  
  deleteCard(cardId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/${cardId}`);
  }

  // --- MÉTODOS PARA O PERFIL DO UTILIZADOR ---
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`);
  }

  updateProfile(updates: { profileImageUrl?: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/me`, updates);
  }
}