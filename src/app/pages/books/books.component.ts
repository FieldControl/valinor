import { Component } from '@angular/core';
import { BookServiceService } from 'src/app/services/book-service.service'

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent {
  books: any
  totalPages?: number

  constructor(private bookService: BookServiceService) { }

  ngOnInit() {
    this.getBooks(1)
  }

  getBooks = (page: number) => {
    this.bookService.getBooks(page).subscribe(response => {
      this.books = response.docs
      this.totalPages = response.pages
    })
  }

  handleCurrentPage = (page: number) => {
    this.getBooks(page)
  }
}
