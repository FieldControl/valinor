import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {

  constructor() { }

  private search_text = new BehaviorSubject<string>("");
  currentSearch = this.search_text.asObservable();

  search_history: Array<string> = [];

  setSearchText(value : string) {
    this.search_text.next(value);
    this.search_history.push(value);
  }

  getSearchHistory() : Array<string> {
    return this.search_history;
  }

}
