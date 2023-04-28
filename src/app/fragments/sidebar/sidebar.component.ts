import { Component, HostListener, OnInit } from '@angular/core';
import { LIST_ANIMATION_LATERAL } from 'src/app/animations/list.animation';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { WindowService } from 'src/app/services/window.service';
import { IContent, SIDEBAR_CONTENT } from './sidebar.content';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [APPEARD, LIST_ANIMATION_LATERAL],
})
export class SidebarComponent implements OnInit {
  @HostListener('window:scroll') onScrollEvent() {
    this.scrolled = true;

    if (window.innerHeight + window.scrollY <= document.body.offsetHeight) {
      this.scrolled = false;
    }
  }

  public subscribeMobile!: Subscription;
  public scrolled: boolean = false;
  public isMobile!: boolean;
  public state = 'ready';

  constructor(private windowService: WindowService) {
    this.isMobile = window.innerWidth <= windowService.widthMobile;
  }

  public get content(): IContent[] {
    return SIDEBAR_CONTENT;
  }

  ngOnInit() {
    this.subscribeMobile = this.windowService.hasMobile.subscribe(
      (hasMobile: boolean) => (this.isMobile = hasMobile)
    );
  }
}
