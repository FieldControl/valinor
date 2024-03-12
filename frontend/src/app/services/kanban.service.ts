import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Kanban } from '../models/kanban';
import { Card } from '../models/card';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private readonly API = `${environment.baseApiUrl}/kanbans`;
  constructor(private http: HttpClient) { }

  list(): Observable<Kanban[]> {
    return this.http.get<Kanban[]>(this.API)
  }

  create(kanban: Kanban): Observable<{ kanban: Kanban, message: string }> {
    const body = { name: kanban.name }
    return this.http.post<{ kanban: Kanban, message: string }>(this.API, body)
  }
  delete(id: string): Observable<{ kanban: Kanban, message: string }> {
    const url = `${this.API}/${id}`;
    return this.http.delete<{ kanban: Kanban, message: string }>(url);
  }
  update(kanban: Kanban): Observable<Kanban> {
    const url = `${this.API}/${kanban.id}`;
    return this.http.patch<Kanban>(url, { name: kanban.name })
  }

  listCardKanban(kanban_id: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.baseApiUrl}/kanbans/${kanban_id}/cards`)
  }

  createCardInKanban(card: Card, kanban_id: string): Observable<{ card: Card, message: string }> {
    const url = `${this.API}/${kanban_id}}/cards`;
    return this.http.post<{ card: Card, message: string }>(url, card)
  }
}
