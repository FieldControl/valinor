import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { Subject, throwError, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError, retryWhen, retry } from "rxjs/operators";
import {SearchService} from "../search.service";


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  public loading: boolean;
  public searchTerm = new Subject<string>();
  public baseUrl = "https://api.github.com/search/repositories";
  public searchResults: any;
  public paginationElements: any;
  public errorMessage: any;
  public page:any;

  constructor() { }

  ngOnInit() {
  }

}
