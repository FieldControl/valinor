// src/app/services/kanban.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CardData {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  data: string;
  status: 'Pendente' | 'Fazendo' | 'Finalizado';
}

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000/cards';  // Verifique se esta URL está correta

  constructor(private http: HttpClient) {}

  getCards(): Observable<CardData[]> {
    return this.http.get<CardData[]>(this.apiUrl);
  }

  createCard(card: Omit<CardData, 'id'>): Observable<CardData> {
    return this.http.post<CardData>(this.apiUrl, card);
  }

  updateCard(id: number, card: Partial<CardData>): Observable<CardData> {
    return this.http.put<CardData>(`${this.apiUrl}/${id}`, card);
  }

  moveCard(id: number, status: 'Pendente' | 'Fazendo' | 'Finalizado'): Observable<CardData> {
    return this.http.patch<CardData>(`${this.apiUrl}/${id}/status`, { status }); // <-- Rota corrigida
  }
  

  deleteCard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
