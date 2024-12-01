import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private refreshColumnsSubject = new Subject<void>();
  refreshColumns$ = this.refreshColumnsSubject.asObservable();

  private editColumnSubject = new Subject<{ id: number; description: string }>();
  editColumn$ = this.editColumnSubject.asObservable();

  private editTaskSubject = new Subject<{ id: number; description: string, id_column: number }>();
  editTask$ = this.editTaskSubject.asObservable();

  notifyRefreshColumns() {
    this.refreshColumnsSubject.next();
  }

  editColumn(id: number, description: string) {
    this.editColumnSubject.next({ id, description });
  }

  editTask(id: number, description: string, id_column: number) {
    this.editTaskSubject.next({ id, description, id_column });
  }
}