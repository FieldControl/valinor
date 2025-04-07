import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  constructor(private http: HttpClient) {}

  getColumns(): Observable<any> {
    return this.http.get('http://localhost:3000/board'); // aqui você troca pela sua API real
  }
}
