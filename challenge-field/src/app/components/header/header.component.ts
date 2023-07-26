import { Component } from '@angular/core';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})

export class HeaderComponent {
  repoName: string = '';

  constructor(public searchService: SearchService) { }

  searchRepo(repoName: string): void {
    if (this.repoName.trim() !== '') {
      this.searchService.search(this.repoName, 1);
    } else {
      return
    }
  }
}
