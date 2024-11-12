import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Column } from './column.model';

@Injectable({
  providedIn: 'root',
})
export class ColumnsService {
  private apiUrl = 'https://fieldkanban-backend-production.up.railway.app/columns';

  constructor(private http: HttpClient) { }

  getAllColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(this.apiUrl);
  }

  createColumn(title: string, order: number): Observable<Column> {
    return this.http.post<Column>(this.apiUrl, { title: 'New Column', order });
  }

  updateColumn(columnId: string, columnData: Partial<Column>): Observable<Column> {
    return this.http.patch<Column>(`${this.apiUrl}/${columnId}`, columnData);
  }

  deleteColumn(columnId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${columnId}`);
  }
}
