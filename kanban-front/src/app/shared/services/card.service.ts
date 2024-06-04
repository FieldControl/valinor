import { Injectable } from "@angular/core";
import { DefaultService } from "./default.service";
import { HttpClient } from "@angular/common/http";
import { ICard } from "../../core/models/card";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})

export class CardService extends DefaultService {
    constructor(private http: HttpClient) {
        super('cards');
    }

    move(id: string, columnId: string): Observable<ICard> {
        return this.http.patch<ICard>(`${this.url}/${id}`, { column: columnId });
    }    

    updatePosition(id: string, newPosition: number): Observable<ICard> {
        return this.http.patch<ICard>(`${this.url}/${id}/position`, { position: newPosition });
    }
  

    list(): Observable<ICard[]> {
        return this.http.get<ICard[]>(this.url)
    }

    findById(id: string): Observable<ICard> {
        return this.http.get<ICard>(`${this.url}/${id}`)
    }

    create(card: Partial<ICard>): Observable<ICard> {
        return this.http.post<ICard>(this.url, card)
    }

    edit(id: string, card: Partial<ICard>): Observable<ICard> {
        return this.http.patch<ICard>(`${this.url}/${id}`, card)
    }

    delete(id: String): Observable<ICard> {
        return this.http.delete<ICard>(`${this.url}/${id}`)
    }
}