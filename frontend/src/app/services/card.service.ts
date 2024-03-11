import { Injectable } from '@angular/core';
import { Card, CardUpdate } from '../models/card';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private http: HttpClient) { }

  deleteCard(idCard: string) {
    const url = `${environment.baseApiUrl}/cards/${idCard}`;
    return this.http.delete<Card>(url);
  }
  updateCard(card: Card | CardUpdate) {
    const url = `${environment.baseApiUrl}/cards/${card.id}`;
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
    const url = `${environment.baseApiUrl}/cards/${card_id}/badge/${badge_id}`;
    return this.http.patch<Card>(url, {})
  }

  unlinkBadgeToCard(card_id: string, badge_id: string) {
    const url = `${environment.baseApiUrl}/cards/${card_id}/badge/${badge_id}`;
    return this.http.delete<Card>(url)
  }

  async updateOrderCard(idsAndNewOrder: Card) {
    const url = `${environment.baseApiUrl}/cards/`;
  }
}
