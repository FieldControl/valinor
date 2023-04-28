import { Component, Input, OnInit } from '@angular/core';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { GithubService } from 'src/app/services/github.service';
import { IRepo, IRepoEvent } from '../profile/profile.interface';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [APPEARD],
})
export class ListComponent implements OnInit {
  public state = 'ready';

  @Input() data!: IRepo[];

  constructor(private gitHubService: GithubService) {}

  ngOnInit(): void {
    this.gitHubService.notifier.subscribe((repos: IRepoEvent) => this.data = repos.repos);
  }

  public goTo(url: string): void {
    let URL: string = '';
    
    if (!/^http[s]?:\/\//.test(url)) {
        URL += 'http://';
    }

    URL += url;

    window.open(URL, '_blank');
  }
}
