import { Component, OnInit } from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import { RepoService} from '../services/repo.service';
import {Items} from '../interface/repositories';

@Component({
  selector: 'spa-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  repositories: Items[] = [];
  name: string = '';

  constructor(private repoService: RepoService) { }

  ngOnInit(): void {
  }

  search(): void {
    this.repoService.read(this.name).subscribe(({ items }) => {
      this.repositories = items
    })
  }

  paginator(event: PageEvent): void {
    this.repoService.read(this.name, event.pageIndex).subscribe(({ items}) => {
      this.repositories = items;
    })
  }
}
