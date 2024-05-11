import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Card } from "../model/card.model";

@Injectable({
    providedIn: 'root'
  })
export class CardService {
    
    public url = "http://localhost:3000/api/card"

    constructor(private http: HttpClient) {}

    getCardsByColumnId(columnId: number): Observable<any> {
      return this.http.get(this.url + "/column/" + columnId);
    }

    addNewCardColumn(columnId: number, title: string): Observable<Card> {
      return this.http.post<Card>(this.url + "/create", { columnId, title });
    }

    updateCardLocation(data: any) {
      return this.http.post(this.url + '/update-location', data);
    }
}