import { Component, OnInit } from '@angular/core';
import { Repositories } from 'src/model/repositories.model';
import { SearchListService } from './search-list.service';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListComponent implements OnInit {

  _searchLine: string = "";
  _page: number = 1;
  searchResult: Repositories[] = [];

  constructor(private searchListService: SearchListService) { }

  ngOnInit(): void { }

  searchRepositories() {
    if (this._searchLine != "") {
      this.searchListService.getApiData(this._searchLine, this._page).subscribe({
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

  set searchLine(value: string) {
    this._searchLine = value;
    this._page = 1;
    this.searchRepositories();
  }

  get searchLine(): any {
    return this._searchLine;
  }

  getPage(){
    return this._page
  }
  displayButton(){
    if (this._searchLine != '') {
      return true;
    } else {
      return false;
    }
  }

}
