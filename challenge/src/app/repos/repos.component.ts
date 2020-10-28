import { MatPaginator } from '@angular/material/paginator';
import { ReposService } from './repos.service';
import { Search } from './repos.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-repos',
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.css']
})
export class ReposComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  search;
  displayedColumns: Array<string> = ['repos'];
  page: number = 1;

  pageIndex: number = 0;
  pageSize: number = 10;
  lenght: Search['total_count'];

  constructor(private reposService: ReposService) { }

  ngOnInit(): void {
    this.getRepos();
  }

  getRepos(query: string = "valinor"): void {

    this.reposService.query = query;
    this.reposService.getRepos().subscribe(search => {
      this.search = new MatTableDataSource(search['items']);
      this.lenght = search['total_count'];

      if (this.lenght > 1000)
        this.lenght = 1000;

      //Atualiza a datatable
      this.paginator._changePageSize(this.paginator.pageSize);
    });
  }

  getPaginatorData(event?) {

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