import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Column } from '../columnInterface';

@Injectable({
  providedIn: 'root'
})
export class ColumnsService {
  baseUrl: string = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  create(data: Column): Observable<Column> {
    return this.http.post<Column>(this.baseUrl, data);
  }

  findAll(): Observable<Column[]> {
    return this.http.get<Column[]>(this.baseUrl);
  }

  update(id: string,data: Column): Observable<Column> {
    return this.http.patch<Column>(`${this.baseUrl}${id}`, data);
  }

  remove(id: string): Observable<Column> {
    return this.http.delete<Column>(`${this.baseUrl}${id}`);
  }
}


