import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Kanban } from './component/kanban';
import { Card } from './component/card';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private readonly API = "http://localhost:3000/kanban";
  constructor(private http: HttpClient) { }

  list(): Observable<Kanban[]> {
    return this.http.get<Kanban[]>(this.API)
  }
  create(kanban: Kanban): Observable<Kanban> {
    return this.http.post<Kanban>(this.API, kanban)
  }
  delete(id: number): Observable<Kanban>{
    const url = `${this.API}/${id}`;
    return this.http.delete<Kanban>(url);
  }
  update(kanban:Kanban): Observable<Kanban> {
    const url = `${this.API}/${kanban.id}`;
    return this.http.put<Kanban>(url,kanban)
  }

  createCard(card:Card, idList: number){
    const url = `${this.API}/${idList}/card`;
    return this.http.post<Card>(url,card)
  }

}
