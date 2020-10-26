import { ReposService } from './repos.service';
import { Search } from './repos.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-repos',
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.css']
})
export class ReposComponent implements OnInit {

  search: Search['items'];
  displayedColumns = ['repos'];

  constructor(private reposService: ReposService) { }

  ngOnInit(): void {
    this.reposService.getRepos().subscribe(search => {
      this.search = search['items'];
    });
  }

}
