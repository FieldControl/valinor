import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';
import { Column } from '../models/Column.interface';

@Injectable()
export class ColumnService {

  private apiURL = environment.apiURL;

  constructor(private http: HttpClient) { }

  addColumn(column: Column): Observable<Column>{
    return this.http.post<Column>(`${this.apiURL}/columns`, column);
  }

  getColumns(): Observable<Column[]>{
    return this.http.get<Column[]>(`${this.apiURL}/columns`);
  }

  getColumnById(id: number): Observable<Column>{
    return this.http.get<Column>(`${this.apiURL}/columns/${id}`);
  }

  updateColumn(id: number, column: Column): Observable<Column>{
    return this.http.put<Column>(`${this.apiURL}/columns/${id}`, column);
  }

  deleteColumn(id: number): Observable<Column>{
    return this.http.delete<Column>(`${this.apiURL}/columns/${id}`);
  }
}
