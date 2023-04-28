import { Component, HostListener, OnInit } from '@angular/core';
import { WindowService } from 'src/app/services/window.service';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { IContent, SIDEBAR_CONTENT } from '../sidebar/sidebar.content';
import { LIST_ANIMATION_LATERAL } from 'src/app/animations/list.animation';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [APPEARD, LIST_ANIMATION_LATERAL],
})
export class HeaderComponent implements OnInit {
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
