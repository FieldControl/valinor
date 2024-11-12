import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from './card.model';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private apiUrl = 'https://fieldkanban-backend-production.up.railway.app/cards';

  constructor(private http: HttpClient) { }

  getAllCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}`);
  }

  createCard(title: string, description: string, columnId: number): Observable<Card> {
    console.log('enviado');
    return this.http.post<Card>(this.apiUrl, { title: 'New Card', description, columnId });
  }

  updateCard(id: number, title: string, description: string, columnId: number): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/${id}`, { title, description, columnId });
  }

  updateCardOrder(id: number, newOrder: number): Observable<Card> {
    console.log('enviado')
    return this.http.patch<Card>(`${this.apiUrl}/${id}`, { order: newOrder });
  }

  deleteCard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
