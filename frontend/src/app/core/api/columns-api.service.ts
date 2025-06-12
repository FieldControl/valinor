import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Column }    from '../../shared/models/column.model';
import { environment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class ColumnsApiService {
  private readonly base = `${environment.apiUrl}/columns`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Column[]>(this.base);
  }

  create(dto: { title: string; order: number }) {
    return this.http.post<Column>(this.base, dto);
  }

  update(id: number, dto: Partial<{ title: string; order: number }>) {
    return this.http.patch<Column>(`${this.base}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
