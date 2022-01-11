import { Component, Injectable, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search/search.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
  }

  handleSearch(query: string, page: number = 1) {
    this.searchService.searchQueryObserver.emit(query);
    this.searchService.find(query, page);
  }


}
