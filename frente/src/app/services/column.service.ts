import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoardColumn } from '../models/column.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {
  private apiUrl = `${environment.apiUrl}/columns`;

  constructor(private http: HttpClient) { }

  getColumns(): Observable<BoardColumn[]> {
    return this.http.get<BoardColumn[]>(this.apiUrl);
  }

  createColumn(title: string): Observable<BoardColumn> {
    return this.http.post<BoardColumn>(this.apiUrl, { title });
  }

  deleteColumn(id: number): Observable<void> {
     return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}