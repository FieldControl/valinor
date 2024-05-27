import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private baseUrl = 'http://localhost:3000/cards'; 

  constructor(private http: HttpClient) { }

  salvarInformacoes(cardsData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cards`, cardsData);
  }
}
