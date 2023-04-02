import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-repositorie-issues',
  templateUrl: './repositorie-issues.component.html',
  styleUrls: ['./repositorie-issues.component.scss']
})
export class RepositorieIssuesComponent implements OnInit{
  constructor(
    public router : Router,
    public routeParam: ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.routeParam.paramMap.subscribe(repo=>{
      console.log(repo.get("username"))
      console.log(repo.get("reponame"))

    })
  }
}
