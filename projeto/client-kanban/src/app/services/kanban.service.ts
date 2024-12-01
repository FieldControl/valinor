import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private refreshColumnsSubject = new Subject<void>();
  refreshColumns$ = this.refreshColumnsSubject.asObservable();

  notifyRefreshColumns() {
    this.refreshColumnsSubject.next();
  }
}