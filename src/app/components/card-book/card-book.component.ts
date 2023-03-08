import { Component, Input } from '@angular/core';
import { BookServiceService } from 'src/app/services/book-service.service'

@Component({
  selector: 'app-card-book',
  templateUrl: './card-book.component.html',
  styleUrls: ['./card-book.component.css']
})
export class CardBookComponent {
  @Input() name?: string
  @Input() id?: string
  @Input() chapter?: string

  chapters: any

  constructor(private bookService: BookServiceService) { }

  getChapters = () => {
    this.bookService.getChapter(this.id).subscribe(response => {
      this.chapters = response.docs
    })
  }
}
