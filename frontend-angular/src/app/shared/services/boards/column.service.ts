import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Icolumn, ICreateColumn, IUpdateColumn } from '../../interfaces/column.interface';
import { Iboard } from '../../interfaces/board.interface';


@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  http = inject(HttpClient);

  createColumn(createColumn: ICreateColumn): Observable<Icolumn> {
    return this.http.post<Icolumn>('http://localhost:3000/column', createColumn);
  }
  updateSwimlane(updateColumn: IUpdateColumn): Observable<Icolumn> {
    return this.http.patch<Icolumn>(`http://localhost:3000/column/${updateColumn.id}`, updateColumn);}
  deleteColumn(columnId: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/column/${columnId}`);
  }
  getColumnByBoardId(BoardId: number): Observable<Icolumn[]> {
    return this.http.get<Icolumn[]>(`http://localhost:3000/column/${BoardId}`);  
  }
  getBoards(): Observable<Iboard[]> {
    return this.http.get<Iboard[]>('http://localhost:3000/column');
  }
}