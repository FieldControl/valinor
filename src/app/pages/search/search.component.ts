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
    const data = new Date(dataString);
    const dataAtual = new Date();

    const diffDias = Math.floor((dataAtual.getTime() - data.getTime()) / (1000 * 60 * 60 * 24));
    const diffMeses = (dataAtual.getFullYear() - data.getFullYear()) * 12 + dataAtual.getMonth() - data.getMonth();
    const diffHoras = Math.floor((dataAtual.getTime() - data.getTime()) / (1000 * 60 * 60));

   if (diffDias <= 30) {
      return `${diffDias} days ago`;
    } else if (diffMeses <= 11) {
      return `${diffMeses} ${diffMeses === 1 ? 'month ago' : 'months ago'}`;
    } else if (diffHoras <= 24) {
      return `${diffHoras} ${diffHoras === 1 ? 'hour ago' : 'hours ago'}`;
    } else {
      const diffAnos = Math.floor(diffMeses / 12);
      return `${diffAnos} ${diffAnos === 1 ? 'year ago' : 'years ago'}`;
    }
  }


}

