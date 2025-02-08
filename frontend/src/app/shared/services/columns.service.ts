import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ICreateColumn,
  IBoard,
  IColumn,
  IUpdateColumn,
} from '../models/board.model';

@Injectable({
  providedIn: 'root',
})
export class ColumnsService {
  http = inject(HttpClient);

  createColumn(createColumn: ICreateColumn): Observable<IColumn> {
    console.log(createColumn);
    return this.http.post<IColumn>('/api/column', createColumn);
  }

  updateColumn(updateColumn: IUpdateColumn): Observable<IColumn> {
    return this.http.patch<IColumn>(
      `/api/column/${updateColumn.id}`,
      updateColumn
    );
  }

  deleteColumn(columnId: number): Observable<void> {
    return this.http.delete<void>(`/api/column/${columnId}`);
  }

  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`/api/column/${id}`);
  }

  getBoards(): Observable<IBoard[]> {
    return this.http.get<IBoard[]>('/api/column');
  }
}
