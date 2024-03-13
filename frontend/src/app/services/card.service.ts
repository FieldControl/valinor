import { Injectable } from '@angular/core';
import { Card, CardUpdate } from '../models/card';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly API = `${environment.baseApiUrl}/cards`;
  constructor(private http: HttpClient) { }

  deleteCard(idCard: string):Observable<{card:Card,message:string}> {
    const url = `${this.API}/${idCard}`;
    return this.http.delete<{card:Card, message: string}>(url);
  }
  updateCard(card: Card | CardUpdate) {
    const url = `${this.API}/${card.id}`;
    const body = {
      kanban_id: card.kanban_id,
      title: card.title,
      description: card.description,
      date_end: card.date_end,
      order: card.order
    }
    return this.http.patch<Card>(url, body)
  }

  linkBadgeToCard(card_id: string, badge_id: string) {
    const url = `${this.API}/${card_id}/badge/${badge_id}`;
    return this.http.patch<Card>(url, {})
  }

  unlinkBadgeToCard(card_id: string, badge_id: string) {
    const url = `${this.API}/${card_id}/badge/${badge_id}`;
    return this.http.delete<Card>(url)
  }
}
