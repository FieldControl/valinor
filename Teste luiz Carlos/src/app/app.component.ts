import { Component } from '@angular/core';
import { Item } from './item';
import { SearchService } from './search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  search = '';
  items: Item[] = [];
  currentPage = 0;
  numOfPages = 0;
  sortDirection: any = {}
  error = ''

  constructor(private searchService: SearchService) {
    this.sortDirection["login"] = true
    this.sortDirection["type"] = true
    this.searchService.searchUpdate.subscribe((result) => {
      if(result.error) {
        this.error = result.error
      } else {
        this.error = ''
        this.numOfPages = result.numOfPages;
      this.items = result.items;
      this.currentPage = result.currentPage
      }
    });
  }

  onSearch(login: string) {
    this.searchService.search(login);
  }

  onPage(i: number) {
    this.searchService.goToPage(i)
  }

  onSort(event: any) {
    this.searchService.sort(event.column, event.direction)
  }
}
