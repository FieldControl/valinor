import { Component, Input, OnInit } from '@angular/core';

import { GithubRep } from 'models';


@Component({
  selector: 'app-repo-card',
  templateUrl: './repo-card.component.html',
  styleUrls: ['./repo-card.component.scss'],
})
export class RepoCardComponent implements OnInit {

  @Input() repository: GithubRep;

  constructor() { }

  ngOnInit() {
  }

}
