import { Component, OnInit  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Repository } from 'src/app/Repository';
import { ApiGITService } from 'src/app/services/api-git.service';
import { SearchService } from 'src/app/services/search.service.service';

@Injectable({
  providedIn: 'root',
})

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent {

  repositories: Repository[] =[];
  total_count: number = 0;
  searchTerm: string = '';

  currentPage: number = 1;
  perPage: number = 10;
  totalPages: number = 1;

  constructor(private apiGIT: ApiGITService, private searchService: SearchService) {}

  ngOnInit(searchTerm: string): void{ 
    this.searchService.getSearchTerm().subscribe(searchTerm => {
      this.loadRepositories(searchTerm, this.currentPage);
    });
  }

  loadRepositories(searchTerm: string, page: number): void {
    this.apiGIT.getAll(searchTerm, page, this.perPage).subscribe((response: { repositories: Repository[], total_count: number }) => {
      this.repositories = response.repositories;
      this.total_count = response.total_count; // Atualiza o total_count
      this.totalPages = Math.ceil(this.total_count / this.perPage);
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRepositories(this.searchTerm, this.currentPage);
      this.searchService.getSearchTerm().subscribe(searchTerm => {
        this.loadRepositories(searchTerm, this.currentPage);
      });
      
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
    this.searchService.getSearchTerm().subscribe(searchTerm=> {
      this.loadRepositories(searchTerm, this.currentPage);
    });
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
    this.searchService.getSearchTerm().subscribe(searchTerm => {
      this.loadRepositories(searchTerm, this.currentPage);
    });
  }
}
