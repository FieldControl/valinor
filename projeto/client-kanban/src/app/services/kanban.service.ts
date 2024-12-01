import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Task } from '../shared/models/task';

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

  private moveTaskSubject = new Subject<{ fromColumnId: number; toColumnId: number; task: Task, currentIndex: number }>();
  moveTask$ = this.moveTaskSubject.asObservable();

  notifyRefreshColumns() {
    this.refreshColumnsSubject.next();
  }

  editColumn(id: number, description: string) {
    this.editColumnSubject.next({ id, description });
  }

  editTask(id: number, description: string, id_column: number) {
    this.editTaskSubject.next({ id, description, id_column });
  }

  moveTask(fromColumnId: number, toColumnId: number, task: any, currentIndex: number) {
    this.moveTaskSubject.next({ fromColumnId, toColumnId, task, currentIndex });
  }
}