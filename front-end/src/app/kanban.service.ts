import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Kanban } from './component/kanban';
import { Card } from './component/card';
import { environment } from '../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private readonly API = `${environment.baseApiUrl}/kanbans`;
  constructor(private http: HttpClient) { }

  list(): Observable<Kanban[]> {
    return this.http.get<Kanban[]>(this.API)
  }

  create(kanban: Kanban): Observable<Kanban> {
    return this.http.post<Kanban>(this.API, kanban)
  }
  delete(id: string): Observable<Kanban>{
    const url = `${this.API}/${id}`;
    return this.http.delete<Kanban>(url);
  }
  update(kanban:Kanban): Observable<Kanban> {
    const url = `${this.API}/${kanban.id}`;
    return this.http.patch<Kanban>(url,{name:kanban.name})
  }

  listCardKanban(kanban_id: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.baseApiUrl}/kanbans/${kanban_id}/cards`)
  }

  createCardInKanban(card:Card, kanban_id: string){
    const url = `${this.API}/$ kanban_id}/cards`;
    return this.http.post<Card>(url,card)
  }
}
