import { Injectable } from '@angular/core';
import { Card } from './component/card';
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
  updateCard(card: Card) {
    const url = `${environment.baseApiUrl}/cards/${card.id}`;
    console.log(card);
    const body = {
      title: card.title,
      description: card.description,
      date_end: card.date_end
    }
    return this.http.patch<Card>(url, body)
  }

  linkBadgeToCard(card_id:string,badge_id:string){
    const url = `${environment.baseApiUrl}/cards/${card_id}/badge/${badge_id}`;
    return this.http.patch<Card>(url,{})
  }

  unlinkBadgeToCard(card_id:string,badge_id:string){
    const url = `${environment.baseApiUrl}/cards/${card_id}/badge/${badge_id}`;
    return this.http.delete<Card>(url)
  }
}
