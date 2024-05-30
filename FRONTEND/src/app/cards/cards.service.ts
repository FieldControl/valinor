import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Card } from './cards.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CardsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getcards(title: string = '')  {
    let url = `${this.apiUrl}/cards`;
    if (title) {
      url += `?title=${title}`;
    }
    
    return this.http.get<Card[]>(url)
  }

  createCard(card: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cards`, card);
  
  }

  updateCard( card: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cards/${card.id}`, card);
  }

  getCardPorId(id: number): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/cards/${id}`);
  }

  
  deleteCard(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cards/${id}`);
  }
  

}
