import { Component, NgModule, OnInit } from '@angular/core';
import { Repository } from 'src/app/models/repository';
import { GithubService } from 'src/app/services/github.service';
import { emojify } from 'node-emoji';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent {

  constructor(private githubService: GithubService) { }

  page: number = 1;
  perPage: number = 10;
  search?: string;
  repositories?: Repository;


  searchRepo(): void {
    this.githubService.getRepositories(this.page, this.perPage, this.search).subscribe(root => {
      this.repositories = root;
    })
  }

  showPerPage() {
    this.githubService.getRepositories(this.page, this.perPage, this.search).subscribe(root => {
      this.repositories = root;
    })
  }

  formatDescription(description: string) {
    return emojify(description);
  }

  formatStars(stargazers: number) {
    return stargazers > 999 ? `${(stargazers / 1000).toFixed(1)}k` : stargazers;
  }

  formatDataUpdated(dataString: string) {
    const pushedAt = new Date(dataString);
    const dateNow = new Date();

    const pushedAgoInMilliseconds = Math.abs(dateNow.getTime() - pushedAt.getTime());
    const pushedAgoInHours = pushedAgoInMilliseconds / (1000 * 60 * 60);

    if (pushedAgoInHours >= 1) {
      const amountHoursTwoDays = 48;
      const amountHoursOneDay = 24;

      if (pushedAgoInHours >= amountHoursTwoDays) {
        return `on ${pushedAt.toLocaleString()}`;
      } else if (pushedAgoInHours >= amountHoursOneDay) {
        return 'yesterday';
      }

      return `${Math.floor(pushedAgoInHours)} hours ago`;
    }

    const pushedAgoInMinutes = pushedAgoInHours * 60;
    if (pushedAgoInMinutes >= 1) {
      return `${Math.floor(pushedAgoInMinutes)} minutes ago`;
    }

    return `${Math.floor(pushedAgoInMinutes * 60)} seconds ago`;
  }


}

