import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaginationService {
  private currentPageSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  currentPage$: Observable<number> = this.currentPageSubject.asObservable();

  changePage(page: number): void {
    this.currentPageSubject.next(page);
  }

  getCurrentPage(): number {
    return this.currentPageSubject.getValue();
  }

  getCurrentPageObservable(): Observable<number> {
    return this.currentPage$;
  }
}
