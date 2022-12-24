import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  title = 'NodeJS';
  description = 'Node.js is a tool for executing JavaScript in a variety of environments.';

  constructor() { };

  ngOnInit() {

  }
}
