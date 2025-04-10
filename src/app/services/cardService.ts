import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs";

export interface Card {
  id: number;
  titulo: string;
  descricao: string

}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private cardsAdicionadosSource = new BehaviorSubject<Card | null>(null);
  cardsAdicionados$ = this.cardsAdicionadosSource.asObservable()
    .pipe(filter(card => card !== null));

  private nextId = 1;

  adicionarCard(titulo: string, descricao: string) {
    const newCard: Card = { id: this.nextId++, titulo: titulo, descricao: descricao };
    this.cardsAdicionadosSource.next(newCard);
  }
}