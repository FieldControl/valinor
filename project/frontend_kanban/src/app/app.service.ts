import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Card {
    id: number;
    titulo: string;
    conteudo: string;
    colunaID: number
}

export interface Column {
    id: number;
    titulo: string;
    cards: Card[]
}

@Injectable({
    providedIn: 'root'
})
export class ApiService{
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    getColumn(): Observable<Column[]> {
        return this.http.get<Column[]>(`${this.apiUrl}/colunas`);
    }

    createColumn(titulo: string): Observable<Column> {
        return this.http.post<Column>(`${this.apiUrl}/colunas`,{titulo});
    }
    deleteColumn(colunaID: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/colunas/${colunaID}`)
    }

    createCard(titulo: string, conteudo: string, colunaID: number): Observable<Card> {
        return this.http.post<Card>(`${this.apiUrl}/cards`, {
            titulo: titulo,
            conteudo: conteudo,
            colunaID: colunaID
        });
    }

    moveCard(cardID: number, newColumnID: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/cards/${cardID}`, {colunaID: newColumnID});
    }

    deleteCard(cardID: number): Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/cards/${cardID}`)
    }
}