import { Injectable } from '@angular/core';
import { Card } from '../card';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CardService {


  private apiUrl = 'http://localhost:3000/column/cards';

  constructor(private http: HttpClient) { }

  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(this.apiUrl);
  }

  createCard(card: Card): Observable<Card> {
    return this.http.post<Card>(this.apiUrl, card);
  }

  updateCard(id: number, card: Card): Observable<Card> {
    return this.http.patch<Card>(`${this.apiUrl}/${id}`, card);
  }

  deleteCard(id: number): Observable<Card> {
    return this.http.delete<Card>(`${this.apiUrl}/${id}`);
  }
}
