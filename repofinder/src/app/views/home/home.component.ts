import { Component, Injectable, OnInit, Input } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { SearchService } from 'src/app/services/search/search.service';
import { GithubRepository } from '../../models/Repository.model';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  breakpoint: number = 10;

  @Input() query : string = '';

  @Input() receiveRepositories: GithubRepository[] = [];

  @Input() public config: PaginationInstance = {
    itemsPerPage: 30,
    currentPage: 1
  };

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 10;
  }

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 10;
  }

  OnPageChange(page: number) {
    this.config.currentPage = page;
    this.searchService.find(this.query, page);
  }
}
