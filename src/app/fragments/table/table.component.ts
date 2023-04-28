import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { GithubService } from 'src/app/services/github.service';
import { IRepo, IRepoEvent } from '../profile/profile.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [APPEARD],
})
export class TableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatTable) public table!: MatTable<IRepo>;
  @ViewChild(MatSort) public sort!: MatSort;

  @Input() public data!: IRepo[];
  @Input() public showPagination: boolean = true;

  public dataSource!: MatTableDataSource<IRepo>;
  public state = 'ready';

  public displayedColumns: string[] = [
    'name',
    'description',
    'forks',
    'language',
    'url',
  ];

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data);

    this.githubService.notifier.subscribe((repos: IRepoEvent) => {
      this.dataSource = new MatTableDataSource(repos.repos);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    if (this.table?.dataSource) { this.table.dataSource = this.dataSource; }

    const paginator = this.paginator?._intl;

    if (paginator) {
      paginator.previousPageLabel = 'Anterior';
      paginator.nextPageLabel = 'Próximo';
      paginator.lastPageLabel = 'Último';
      paginator.firstPageLabel = 'Primeiro';
      paginator.itemsPerPageLabel = 'Itens por página';
    }
  }

  public goTo(url: string): void {
    let URL: string = '';

    if (!/^http[s]?:\/\//.test(url)) {
      URL += 'http://';
    }

    URL += url;

    window.open(URL, '_blank');
  }
}
