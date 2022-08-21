import { Component, OnInit } from '@angular/core';
import { SearchListService } from './search-list.service';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListComponent implements OnInit {

  _searchLine: string = "";
  searchResult: any;

  constructor(private searchListService: SearchListService) { }

  ngOnInit(): void { }

  set searchLine(value: string) {
    this._searchLine = value;

    if (this._searchLine != "") {
      this.searchListService.getApiData(this._searchLine).subscribe({
        next: result => {
          this.searchResult = result;
        },
        error: error => {
          console.log('error: ' + error)
        }
      });
      
    }
    console.log(this.searchResult)
  }

  get searchLine(): any {
    return this._searchLine
  }

}
