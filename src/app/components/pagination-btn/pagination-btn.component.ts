import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-btn',
  standalone: true,
  imports: [],
  templateUrl: './pagination-btn.component.html',
  styleUrl: './pagination-btn.component.css',
})
export class PaginationBtnComponent {
  countPage: number = 1;
  @Input() totalPages: number = 0;
  @Output() nextPage = new EventEmitter();
  @Output() previousPage = new EventEmitter();

  // emitir evento para home
  // proxima página
  setNextPage() {
    if (this.countPage < this.totalPages / 8) {
      this.countPage += 1;
      this.nextPage.emit();
    }
  }

  // pagina anterior
  setPreviousPage() {
    if (this.countPage > 1) {
      this.countPage -= 1;
      this.previousPage.emit();
    }
  }
}
