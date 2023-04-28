import { Subscription } from 'rxjs';
import { IProfile } from './profile.interface';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { WindowService } from 'src/app/services/window.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [APPEARD],
})
export class ProfileComponent implements OnInit {
  @Output() isRepoEvent = new EventEmitter<string>();

  @Input() public profile!: IProfile;
  @Input() public isLoading: boolean = false;
  
  public state = 'ready';
  public isMobile: boolean;  
  public subscribeMobile!: Subscription;

  constructor(private windowService: WindowService) { this.isMobile = window.innerWidth <= windowService.widthMobile; }

  ngOnInit() {
    this.subscribeMobile = this.windowService.hasMobile.subscribe((hasMobile: boolean) => (this.isMobile = hasMobile));
  }

  public goTo(url: string): void {
    let URL: string = '';
    
    if (!/^http[s]?:\/\//.test(url)) {
        URL += 'http://';
    }

    URL += url;

    window.open(URL, '_blank');
  }

  public goTwitter(username: string): void {
    window.open(`https://twitter.com/${username}`, '_blank');
  }

  public goRepos(user: string): void {
    this.isRepoEvent.emit(user);
  }
}
