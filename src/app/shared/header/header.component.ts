import {
  Component,
  ElementRef,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';

import PaginationModel from 'src/app/models/pagination';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
  providers: [
    { 
      provide: "searchText",
      multi: true,
      useValue: "teste",
      useExisting: HeaderComponent,
    }
  ]
})
export class HeaderComponent {
  @Output() searchEvent = new EventEmitter<PaginationModel>();

  searchText = '';
  @ViewChild('searchbar') searchbar!: ElementRef<HTMLInputElement>;
  toggleSearch: boolean = false;

  openSearch() {
    this.toggleSearch = true;
    this.searchbar.nativeElement.focus();
  }
  searchClose() {
    this.searchText = '';
    this.toggleSearch = false;
  }
  onSearch(searchText: string) {
    if (searchText !== '' && searchText !== null) {
      localStorage.setItem("queryString", searchText);

      this.searchEvent.emit(new PaginationModel(undefined, undefined, searchText));
    }
  }
}
