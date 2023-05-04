import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, filter, map, switchMap, take, tap } from 'rxjs';
import { GithubService } from 'src/app/services/github.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit {
  reporesult: any;
  campobusca = new FormControl();
  total_result: number = 0;
  index: number = 1;
  loading: boolean = false;
  search = '';
  type = 'repositories';
  constructor(private gitService: GithubService) {}

  // reporesult$ = this.campobusca.valueChanges
  //   .pipe(
  //     debounceTime(300),
  //     filter((enteredValue) => enteredValue.length >= 3),
  //     // tap(() => console.log('bateu aqui!')),
  //     map((enteredValue) => (this.search = enteredValue)),
  //     switchMap((enteredValue) =>
  //       this.gitService.getRepositories(enteredValue, this.index, this.type)
  //     ),
  //     map((result) => result ?? []),
  //     // tap((returnAPI) => console.log('retorno', returnAPI)),
  //     map(
  //       (items) => (
  //         (this.reporesult = items.items),
  //         (this.total_result = items.total_count)
  //       )
  //     )
  //   )
  //   .subscribe();

  ngOnInit(): void {}



  previous() {
    if (this.index > 1) {
      this.index = this.index - 1;
      this.getAllData();
    }
  }
  onSearchTermEvent(newTerm: string) {
    this.search = newTerm;
  }

  searchData(e: any) {
    this.getAllData();
  }
  next() {
    if (this.index >= 1) {
      this.index = this.index + 1;
      console.log(this.index);

      this.getAllData();
    }
  }

  getAllData() {
    this.loading = true;
    this.gitService
      .getRepositories(this.search, this.index, this.type)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          console.log('hello', res);
          this.reporesult = res.items;
          this.total_result = res.total_count;
        },
      });
  }

  requestByType(type: string) {
    if (this.search.length > 0) {
      this.type = type;

      this.getAllData();
    }
  }
}
