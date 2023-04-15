import { Component, OnInit } from '@angular/core';
import { ApiGoogleBooksService } from 'src/services/ApiGoogleBooks.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  books: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalItems: number = 0;
  totalPages: number = 0;
  displayPages: number[] = [];
  searchQuery: string = '';

  constructor(private apiGoogleBooksService: ApiGoogleBooksService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || 'Angular';
      this.currentPage = 1;
      this.loadBooks(this.searchQuery, this.currentPage);
    });
  }

  loadBooks(query: string, page: number): void {
    this.apiGoogleBooksService.searchBooks(query, page, this.itemsPerPage).subscribe((data: { totalItems: any; items: any[]; }) => {
      this.books = data.items.map((item: any) => {
        return {
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || [],
          thumbnail: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150x200.png',
          description: item.volumeInfo.description || '',
          publishedDate: item.volumeInfo.publishedDate || ''
        };
      });
      this.totalItems = data.totalItems;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updateDisplayPages();
    }, (error: any) => {
      console.error('Erro na chamada à API:', error);
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBooks(this.searchQuery, this.currentPage);
    }
  }

  getPagesArray(): number[] {
    return this.displayPages;
  }

  updateDisplayPages(): void {
    let startPage = Math.max(1, this.currentPage - 5);
    let endPage = Math.min(this.totalPages, startPage + 9);
    startPage = Math.max(1, endPage - 9);
    this.displayPages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
}
