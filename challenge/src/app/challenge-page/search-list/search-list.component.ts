import { Component } from '@angular/core';
import { take } from 'rxjs';
import { Repositories } from 'src/model/repositories.model';
import { SearchListService } from './search-list.service';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListComponent {

  private _searchLine: string = "";
  private _page: number = 1;
  searchResult: Repositories[] = [];

  constructor(private searchListService: SearchListService) { }

  searchRepositories() {
    if (this._searchLine != "") {
      this.searchListService.getApiData(this._searchLine, this._page).pipe(take(1)).subscribe({
        next: result => {
          this.searchResult = result.items;
        },
        error: error => {
          console.log('error: ' + error);
        }
      });
    }
  }
  nextPage() {
    this._page = this._page + 1;
    console.log(this._page);
    this.searchRepositories();
  }
  backPage() {
    if (this._page > 1) {
      this._page = this._page - 1;
      this.searchRepositories();
    }
  }
  getPage(): number{
    return this._page
  }
  displayButton(){
    if (this._searchLine != '') {
      return true;
    } else {
      return false;
    }
  }

  set searchLine(value: string) {
    this._searchLine = value;
    this._page = 1;
    this.searchRepositories();
  }

  get searchLine(): string {
    return this._searchLine;
  }
}
