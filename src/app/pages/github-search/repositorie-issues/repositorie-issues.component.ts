import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubService } from '../../services/github.service';

@Component({
  selector: 'app-repositorie-issues',
  templateUrl: './repositorie-issues.component.html',
  styleUrls: ['./repositorie-issues.component.scss']
})
export class RepositorieIssuesComponent implements OnInit{
  constructor(
    public router : Router,
    public routeParam: ActivatedRoute,
    private service: GithubService,
  ){}

  ngOnInit(): void {
    this.routeParam.paramMap.subscribe(repo=>{
      let username = repo.get("username");
      let reponame = repo.get("reponame");
      if(username != null && reponame!= null){
        this.service.getIssues(username!,reponame!,1).subscribe(res=>{
          console.log(res.items);
        })
      }
    })
  }
}
