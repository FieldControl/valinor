import { Component, OnInit, OnDestroy } from '@angular/core';
import { GetDataApiGitHub } from '../../services/get-service';
import { dataGitHub } from '../../interface';
import { Subscription, forkJoin, of } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})

export class ListComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  dataApi: dataGitHub[] = [];
  perPage: number = 12;
  items: any[] = [];
  totalPages: number;
  option: string = '';
  term: string = '';
  currentPage: number = 1;
  private initialSubscription!: Subscription;
  private pageSubscription!: Subscription;

  constructor(private listDataService: GetDataApiGitHub) {
    /*-- GitHub API limits 1000 items per query --*/
    this.totalPages = Math.ceil(1000 / this.perPage);
  }

  ngOnInit(): void {

    /*-- Function responsible for taking data from the observer and populating the array --*/
    this.initialSubscription = this.listDataService.currentMessage.subscribe({
      next: (res: Array<any>) => {
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
      },
      error(err) {
        console.log('Opa deu erro', err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.initialSubscription) {
      this.initialSubscription.unsubscribe();
    }

    if (this.pageSubscription) {
      this.pageSubscription.unsubscribe();
    }
  }

  /*-- Function responsible for taking the current page and fetching the data --*/
  onPageChange(page: number) {
    this.currentPage = page;

    /*-- Function responsible for inserting data into the observer according to the pagination --*/
    this.pageSubscription = this.getDataApi().subscribe({
      next: (data: any) => {
        this.listDataService.changeMessage([this.option, this.term, data, this.currentPage, this.perPage] || []);
      },
      error(err) {
        console.log('Opa deu erro', err);
      },
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
