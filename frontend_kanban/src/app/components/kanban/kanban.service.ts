import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CardModel, ColumnModel } from "../../models/kanban.model";

@Injectable({
    providedIn: 'root'
})

export class KanbanService {
    private API_URL = 'http://localhost:3000'

    constructor(private http: HttpClient){}

    getColumns(): Observable<ColumnModel[]>{
        return this.http.get<ColumnModel[]>(`${this.API_URL}/column`);
    }

    createColumn(column: Omit<ColumnModel, 'id'>): Observable<ColumnModel>{
        return this.http.post<ColumnModel>(`${this.API_URL}/column`, column);
    }

    updateColumn(id: string, column: Partial<ColumnModel>): Observable<ColumnModel>{
        return this.http.patch<ColumnModel>(`${this.API_URL}/column/${id}`, column);
    }

    deleteColumn(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/column/${id}`);
    }

    getCardsByColumn(columnId: string): Observable<CardModel[]> {
        return this.http.get<CardModel[]>(`${this.API_URL}/card/byColumn/${columnId}`);
    }

    createCard(card: Omit<CardModel, 'id'>): Observable<CardModel> {
        return this.http.post<CardModel>(`${this.API_URL}/card`, card);
    }

    updateCard(id: string, card: Partial<CardModel>): Observable<CardModel> {
        return this.http.patch<CardModel>(`${this.API_URL}/card/${id}`, card);
    }

    deleteCard(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/card/${id}`);
    }

}