import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-repository-results',
  templateUrl: './repository-results.component.html',
  styleUrls: ['./repository-results.component.scss']
})
export class RepositoryResultsComponent implements OnInit {

  total_count = 1474715;
  full_name = 'goldbergyoni/nodebestpractices';
  description = 'The Node.js best practices list (November 2022)';

  /*find languages
    https://api.github.com/repos/goldbergyoni/nodebestpractices/languages
  */


  /*find topics in github
    https://api.github.com/repos/goldbergyoni/nodebestpractices/topics
    {"names": ["nodejs", "javascript", "node"]}
    'GET /repos/{owner}/{repo}/topics{?page,per_page}'
  */
  topics: string[] = [
    "best-practices",
    "es6",
    "eslint",
    "express",
    "expressjs",
    "javascript",
    "jest",
    "microservices",
    "mocha",
    "node-js",
    "nodejs",
    "nodejs-development",
    "npm",
    "rest",
    "style-guide",
    "styleguide",
    "testing",
    "types"
  ];

  //stargazers_url = "https://api.github.com/repos/{{user}}/{{name}}/stargazers",

  constructor() { }

  ngOnInit() {

  }
}
