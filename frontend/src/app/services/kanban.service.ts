import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Column } from '../models/column.model';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000/columns';

  constructor(private http: HttpClient) {}

  getColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(this.apiUrl);
  }
}
