import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements AfterViewInit {

  @Input() set onChangeNav(value: boolean) {
    this.changeNav = !this.changeNav
  }
  @ViewChild('navRef') navRef!: ElementRef

  changeNav!: boolean
  closedBtnNav!: boolean
  navElement!: HTMLElement

  constructor() {
    window.innerWidth < 870 ? this.changeNav = false : this.changeNav = true
  }

  ngAfterViewInit(): void {
    this.navElement = this.navRef.nativeElement
  }

  @HostListener('window:resize', ['$event'])
  positionNav() {
    if (window.innerWidth < 870) {
      this.navElement.classList.add('positonAbsolute')
      this.changeNav = true
      this.closedBtnNav = true
    } else {
      this.navElement.classList.remove('positonAbsolute')
      this.changeNav = false
      this.closedBtnNav = false
    }
  }

}
