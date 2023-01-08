import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  /*search - https://docs.github.com/en/rest/search?apiVersion=2022-11-28#search-repositories

    per_pageinteger
  The number of results per page (max 100).

  Default: 30

  pageinteger
  Page number of the results to fetch.

  Default: 1*/

  //url = https://api.github.com/search/repositories?q=

  //console.log(url);

  repositoryQuery:string = 'aa';

  constructor() { }

  ngOnInit() { }



}
