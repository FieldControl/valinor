import { Injectable, signal } from '@angular/core';
import { Column, CreateColumnBody, EditColumnBody } from '../interfaces/column';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {

  columns = signal<Column[]>([])

  constructor(private http: HttpClient) {
    this.listColumns()
  }

  listColumns() {
    this.http.get<Column[]>(`${API_URL}/columns`).subscribe((columns) => {
      this.columns.set(columns)
    })
  }

  refreshColumns() {
    this.listColumns()
  }

  createColumn(createColumnBody: CreateColumnBody) {
    this.http.post<Column>(`${API_URL}/columns`, createColumnBody).subscribe({
      next: () => {
        this.refreshColumns()
      }
    })
  }

  editColumn(columnId: number, editColumnBody: EditColumnBody) {
    this.http.patch<Column>(`${API_URL}/columns/${columnId}`, editColumnBody).subscribe({
      next: () => {
        this.refreshColumns()
      }
    })
  }

  deleteColumn(columnId: number) {
    this.http.delete(`${API_URL}/columns/${columnId}`).subscribe({
      next: () => {
        this.refreshColumns()
      }
    })
  }
}
