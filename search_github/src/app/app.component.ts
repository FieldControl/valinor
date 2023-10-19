import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Item } from './model/github.model';
import { GithubService } from './service/github.service';
import { Observable } from 'rxjs';
import { Data } from './model/github.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'search_github';

  repositories: Item[] = [];
  q: string = '';
  sortAndOrder: string = 'best-match';
  /* response = new Observable<Data>(); */


  constructor(private githubService: GithubService) {
    this.findRepositories();
  }

  findRepositories() {
    this.githubService.findRepositories(this.q, this.sortAndOrder).subscribe(data => {
      this.repositories = data.items;
    });
/*     this.response = this.githubService.findRepositories();

    this.response.subscribe(data => {
      this.repositories = data.items;
    }); */
  }
}
