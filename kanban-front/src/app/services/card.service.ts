import { Injectable } from "@angular/core";
import { DefaultService } from "./default.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ICard } from "../models/card";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})

export class CardService extends DefaultService {
    constructor(private http: HttpClient) {
        super('cards');
    }

    list(): Observable<ICard[]> {
        return this.http.get<ICard[]>(this.url)
    }

    find(conditions: any): Observable<ICard> {
        let params = new HttpParams();
        for (const key in conditions) {
            if (conditions.hasOwnProperty(key)) {
                params = params.set(key, conditions[key]);
            }
        }
        return this.http.get<ICard>(this.url, { params });
    }

    findById(id: string): Observable<ICard> {
        return this.http.get<ICard>(`${this.url}/${id}`)
    }

    create(card: ICard): Observable<ICard> {
        return this.http.post<ICard>(this.url, card)
    }

    edit(card: ICard): Observable<ICard> {
        return this.http.put<ICard>(`${this.url}/${card._id}`, card)
    }

    delete(id: String): Observable<ICard> {
        return this.http.delete<ICard>(`${this.url}/${id}`)
    }
}