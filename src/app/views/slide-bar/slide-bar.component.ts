import { AfterViewInit, Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-slide-bar',
  templateUrl: './slide-bar.component.html',
  styleUrls: ['./slide-bar.component.css']
})

export class SlideBarComponent implements AfterViewInit {
  
  constructor(private elementRef : ElementRef) {}

  ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector(".filter-list")
    .addEventListener('click', this.onClickEvent.bind(this));
  }

  onClickEvent(event : PointerEvent) : void {
    var srcElement : any = event.target;
    var listRow = document.querySelectorAll(".row");

    // Remove all item selected from filter list
    for (var i = 0; i < listRow.length; i++) {
      listRow[i].children[0].classList.remove("item-selected");
    }

    // Add selection style to filter item
    if (srcElement && srcElement.parentNode.classList.contains("row")) {
      this.switchToActiveOrInactive(srcElement.parentNode);
    }
  }
  
  switchToActiveOrInactive(element : any) : void {
    if (element.children[0].classList.contains("item-selected")) {
      element.children[0].classList.remove("item-selected");
    } else {
      element.children[0].classList.add("item-selected");
    }
  }
}
