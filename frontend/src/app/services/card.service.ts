import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { cardType } from '../model/card.type';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  http = inject(HttpClient);
  cardArray: Array<cardType> = [{
    item: '',
    id: 0,
  }]

  getColumns() {
    return this.cardArray;
  }
}
