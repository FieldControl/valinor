import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ICard } from "../models/board.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class CardService {
    http = inject(HttpClient);

    updateCardOrdersAndSwimlanes(
        boardCod: number,
        cards: ICard[]
    ): Observable<ICard[]> {
        return this.http.put<ICard[]>('/api/card/update-order', {
            boardCod,
            cards,
        });
    }

    createCard(createCard: Partial<ICard>): Observable<ICard> {
        return this.http.post<ICard>('/api/card', createCard);
    }

    updateCard(idCard: number, createCard: Partial<ICard>): Observable<ICard> {
        return this.http.patch<ICard>('/api/card/${idCard}', createCard);
    }

    deleteCard(cardCod: number): Observable<void> {
        return this.http.delete<void>('/api/card/${cardCod}');
    }

    getCardById(idCard: number): Observable<ICard> {
        return this.http.get<ICard>('/api/card/${idCard}');
    }

    getCards(): Observable<ICard[]> {
        return this.http.get<ICard[]>('/api/card');
    }
}