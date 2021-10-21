import { Component, OnInit } from '@angular/core';
import { RepositoriesService } from './services/repositories.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  searchTerm!: string;
  repositories!: [];

  constructor(private repositoriesService: RepositoriesService) {}

  searchRepositories(searchTerm: string) {
    this.searchTerm = searchTerm;
    console.log(searchTerm);
    this.repositoriesService
      .getReposOnSearch(searchTerm)
      .subscribe((res: any) => {
        console.log(res.items);
        this.repositories = res.items;
        return res;
      });
  }

  ngOnInit(): void {}
}
