import { Component, OnInit } from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import { RepositoriesService } from '../../services/repositories.service';
import { IItems } from '../../interfaces/IRepositorie';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  repositories: IItems[] = [];
  name: string = "";
  constructor(private repositoriesService: RepositoriesService) { }

  ngOnInit(): void {

  }

  search(): void {
    this.repositoriesService.read(this.name).subscribe(({ items }) => {
      this.repositories = items
    });
  }

  pagination(event: PageEvent): void {
    this.repositoriesService.read(this.name,event.pageIndex ).subscribe(({ items }) => {
      this.repositories = items
    });
  }
}
