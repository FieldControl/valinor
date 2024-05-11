import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Column } from "../model/column.model";

@Injectable({
    providedIn: 'root'
  })
export class ColumnService {
    
    public url = "http://localhost:3000/api/column"

    constructor(private http: HttpClient) {}

    getAllColumns(): Observable<any> {
        return this.http.get(this.url);
    }

    addNewColumn(title: string): Observable<Column> {
      return this.http.post<Column>(this.url + "/create", { title });
    }

    updateColumn(columnId: number, updates: { title?: string }): Observable<Column> {
      return this.http.put<Column>(this.url + `/${columnId}/updateTitle`, updates);
    }

    updateCardColumn(cardId: number, sourceColumn: string, targetColumn: string): Observable<any> {
        // Supondo que você tenha uma rota no seu backend para atualizar o estado do cartão
        // e que você esteja usando um método PUT para isso
        const url = `url_do_seu_backend/cards/${cardId}/move`;
    
        // Supondo que você precise enviar os dados da coluna de origem e destino no corpo da requisição
        const requestBody = {
          sourceColumn: sourceColumn,
          targetColumn: targetColumn
        };
    
        // Realize a chamada HTTP para atualizar o estado do cartão
        return this.http.put(url, requestBody);
      }
}