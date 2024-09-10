import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Column } from '../types/column.interface';
import { UpdateColumnDto } from '../types/dtos/update-column.dto';
import { CreateColumnDto } from '../types/dtos/create-column.dto';

@Injectable({
  providedIn: 'root',
})
export class ColumnsService {
  readonly url = 'http://localhost:3000/columns';

  private allColumnsSubject: BehaviorSubject<Column[]> = new BehaviorSubject<
    Column[]
  >([]);
  private allColumns$: Observable<Column[]> =
    this.allColumnsSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    this.fetchColumns();
  }

  fetchColumns() {
    this.httpClient.get<Column[]>(this.url).subscribe((response) => {
      this.allColumnsSubject.next(response);
    });
  }

  getAllColumns() {
    return this.allColumns$;
  }

  createColumn(createColumnDto: CreateColumnDto) {
    this.httpClient
      .post<Column>(`${this.url}`, createColumnDto)
      .subscribe(() => {
        this.fetchColumns();
      });
  }

  updateColumn(columnId: string, updateColumnDto: UpdateColumnDto) {
    this.httpClient
      .patch<Column>(`${this.url}/${columnId}`, updateColumnDto)
      .subscribe(() => {
        this.fetchColumns();
      });
  }

  deleteColumn(columnId: string) {
    this.httpClient.delete(`${this.url}/${columnId}`).subscribe(() => {
      this.fetchColumns();
    });
  }
}
