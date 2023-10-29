import { Component, OnInit } from '@angular/core';
import { StarWarsService } from 'src/app/core/star-wars.service';
import { People } from 'src/app/models/people.model';
import { catchError } from 'rxjs/operators';
import { ResultWapper } from 'src/app/core/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private _swService: StarWarsService) { }
  pageNumber: number = 1;
  peoples: People[] = [];
  peoplesBkp: People[] = [];
  shouldHideLoad: boolean = true;
  showWarning: boolean = false;
  textSearched: string = ''
 
  ngOnInit(): void {
    this.doSearch('');
  }
  receiveSearchText(response: string) {
    this.showWarning = false;
    this.doSearch(response);
  }

  doSearch(text: string): void {
    this.shouldHideLoad = false;

    const searchObservable = text
      ? this._swService.searchPeople(text)
      : this._swService.getPeople();  

    searchObservable.pipe(
      catchError(error => {
        console.error('Error during the search of the element', error);
        return [];
      })
    ).subscribe((res: ResultWapper<People>) => {
      if(res.count) {
        this.textSearched = (text);
        this.peoples = res.results;
        this.peoplesBkp = this.peoples;
        this.shouldHideLoad = true;
      } else {
        this.showWarning = true;
        this.shouldHideLoad = true;
      }
    });
  }

  loadMore(): void {
    this.pageNumber += 1;
    this.shouldHideLoad = false;

    this._swService.getPagination(this.pageNumber)
      .pipe(
        catchError(error => {
          console.error('Error when getting page content', error);
          return [];
        })
      )
      .subscribe((res: any) => {
        const pageContent: People[] = res.results;
        this.peoples = this.peoples.concat(pageContent);
        this.shouldHideLoad = true;
      });
  }
}
