import { Component, OnInit } from '@angular/core';
import { RepositoriesService } from './services/repositories.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  throttle = 0;
  distance = 2;
  page: number = 1;
  searchTerm!: string;
  repositories!: [];

  constructor(private repositoriesService: RepositoriesService) {}

  searchRepositories(searchTerm: string) {
    this.searchTerm = searchTerm;
    console.log(searchTerm);
    this.repositoriesService
      .getReposOnSearch(searchTerm, this.page)
      .subscribe((res: any) => {
        console.log(res.items);
        this.repositories = res.items;
        return res;
      });
  }
  onScroll(): void {
    this.repositoriesService
      .getReposOnSearch(this.searchTerm, ++this.page)
      .subscribe((res: any) => {
        console.log(res.items);
        this.repositories = res.items;
        return res;
      });
  }

  ngOnInit(): void {}
}
