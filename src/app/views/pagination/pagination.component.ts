import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  
  @Input() currentPage!: number;
  @Output() pageChanged = new EventEmitter<number>();


  changeIndexedColorElement(elementIndex : number) : void {
    var elements = document.querySelectorAll(".col");
    for (var i = 0 ; i < elements.length - 2; i++) {
      if (i == elementIndex) {
        elements[i].children[0].classList.add('dot-selected');
      } else {
        elements[i].children[0].classList.remove('dot-selected');
      }
    }
  }

  previousPage() : void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChanged.emit(this.currentPage);
      this.changeIndexedColorElement(this.currentPage);
    }
  }

  goToPage(pageIndex : number) : void {
    if (pageIndex >= 1) {
      this.currentPage = pageIndex;
      this.pageChanged.emit(this.currentPage);
      this.changeIndexedColorElement(this.currentPage);
    }
  }

  nextPage() : void {
    this.currentPage++;
    this.pageChanged.emit(this.currentPage);
    this.changeIndexedColorElement(this.currentPage);
  }
  
}
