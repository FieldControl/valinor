import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private apiUrl = 'http://localhost/meu-kanban/backend/services/tarefas.json';

  constructor(private http: HttpClient) {}

  getAllTarefas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

}
