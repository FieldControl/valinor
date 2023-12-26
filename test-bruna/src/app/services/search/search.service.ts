import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private searchQuerySource = new BehaviorSubject<string>('fieldcontrol');
  currentSearchQuery = this.searchQuerySource.asObservable();

  updateSearchQuery(query: string): void {
    this.searchQuerySource.next(query);
  }

  constructor() { }
}
