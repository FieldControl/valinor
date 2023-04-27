import { Component, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Output() searchChanged = new EventEmitter<string>();
  private searchChangedSubject = new Subject<string>();
  search = '';

  constructor() {
    this.searchChangedSubject
      .pipe(debounceTime(1500))
      .subscribe((searchValue) => {
        if (searchValue.length > 0) {
          this.searchChanged.emit(searchValue);
        }
      });
  }

  onSearchChanged() {
    this.searchChangedSubject.next(this.search);
  }
}
