import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Column } from '../Models/column.model';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  private baseUrl = `${environment.apiUrl}/columns`;

  constructor(private http: HttpClient) {}

  getAllColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(this.baseUrl);
  }

  getColumnById(id: string): Observable<Column> {
    return this.http.get<Column>(`${this.baseUrl}/${id}`);
  }

  createColumn(column: Column): Observable<Column> {
    return this.http.post<Column>(this.baseUrl, column);
  }

  updateColumn(id: string, column: Column): Observable<Column> {
    return this.http.patch<Column>(`${this.baseUrl}/${id}`, column);
  }

  deleteColumn(id: string): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${id}`);
  }
}
