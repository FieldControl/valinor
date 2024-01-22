import { Component } from '@angular/core';

@Component({
  selector: 'app-pagination-btn',
  standalone: true,
  imports: [],
  templateUrl: './pagination-btn.component.html',
  styleUrl: './pagination-btn.component.css',
})
export class PaginationBtnComponent {
  nextList() {
    console.log('Next');
  }

  previousList() {
    console.log('Previous');
  }
}
