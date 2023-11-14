import { Component, OnInit } from '@angular/core';
import { GetDataApiGitHub } from '../../services/get-service';
import { dataGitHub } from '../../interface';
import { forkJoin, of } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})

export class ListComponent implements OnInit {
  isLoading: boolean = false;
  dataApi: dataGitHub[] = [];
  perPage: number = 12;
  items: any[] = [];
  totalPages: number;
  option: string = '';
  term: string = '';
  currentPage: number = 1;

  constructor(private listDataService: GetDataApiGitHub) {
    /*-- GitHub API limits 1000 items per query --*/
    this.totalPages = Math.ceil(1000 / this.perPage);
  }

  ngOnInit(): void {

    /*-- Function responsible for taking data from the observer and populating the array --*/
    this.listDataService.currentMessage.subscribe((res: Array<any>) => {
      const [option, searchText, data, currentPage, perPage] = res;

      this.isLoading = true;

      if (data?.items && data?.items?.length) {
        this.option = option;
        this.term = searchText;
        this.dataApi = data.items;
        this.perPage = perPage;
        this.currentPage = currentPage;
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;

    /*-- Function responsible for inserting data into the observer --*/
    this.getDataApi().subscribe((data: any) => {
      this.listDataService.changeMessage([this.option, this.term, data, this.currentPage, this.perPage] || []);
    });
  }

  /*-- Function responsible for fetching data from the new page --*/
  getDataApi() {
    this.isLoading = true;
    return this.listDataService.getDataByTerm(this.option, this.term, this.currentPage, this.perPage)
      .pipe(
        switchMap(({ items }) => {
          const obs$ = items.map((item: any) => {
            return this.listDataService.getDataByURL(item.url);
          });
          return forkJoin(obs$).pipe(
            mergeMap((items) => {
              this.isLoading = false;
              return of({ items });
            })
          );
        })
      );
  }

}
