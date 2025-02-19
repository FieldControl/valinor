import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';
import { Card } from '../models/Card.interface';

@Injectable()
export class CardService {

  private apiURL = environment.apiURL;

  constructor(private http: HttpClient) { }

  addCard(card: Card): Observable<Card>{
    return this.http.post<Card>(`${this.apiURL}/cards`, card);
  }

  getCards(): Observable<Card[]>{
    return this.http.get<Card[]>(`${this.apiURL}/cards`);
  }

  getCardById(id: number): Observable<Card>{
    return this.http.get<Card>(`${this.apiURL}/cards/${id}`);
  }

  updateCard(id: number, card: Card): Observable<Card[]>{
    console.log('UPDATE...', card)    
    return this.http.put<Card[]>(`${this.apiURL}/cards/${id}`, card);
  } 

  deleteCard(id: number): Observable<Card>{
    return this.http.delete<Card>(`${this.apiURL}/cards/${id}`);
  }
}
