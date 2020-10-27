import { MatPaginator } from '@angular/material/paginator';
import { ReposService } from './repos.service';
import { Search } from './repos.model';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-repos',
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.css']
})
export class ReposComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  search: Search['items'];
  displayedColumns: Array<string> = ['repos'];
  page: number = 1;

  pageIndex: number = 0;
  pageSize: number = 10;
  lenght: Search['total_count'];

  constructor(private reposService: ReposService) { }

  ngOnInit(): void {
    this.reposService.getRepos().subscribe(search => {
      this.search = search['items'];
      this.lenght = search['total_count'];

      if (this.lenght > 1000)
        this.lenght = 1000;
    });
  }

  getPaginatorData(event) {
    if (event.pageIndex === this.pageIndex + 1) {
      this.nextPage();
    }
    else if (event.pageIndex === this.pageIndex - 1) {
      this.previousPage();
    }
    this.pageIndex = event.pageIndex;
  }

  nextPage(): void {

    if (this.page < 10) {

      this.page += 1;

      this.reposService.nextPage(this.page).subscribe(search => {
        this.search = search['items'];
      });
    }
  }

  previousPage(): void {

    if (this.page > 1) {

      this.page -= 1;

      this.reposService.previousPage(this.page).subscribe(search => {
        this.search = search['items'];
      });
    }
  }

  kFormatter(num: number) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num);
  }
}
